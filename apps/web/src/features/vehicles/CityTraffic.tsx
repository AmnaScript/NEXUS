
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import Vehicle from "./Vehicle";
import type { VehicleKind } from "./Vehicle";

import {
    circleHitsVehicle,
    clearTrafficSnapshots,
    npcWouldCollide,
    updateTrafficSnapshots,
    vehicleRadius,
} from "./trafficSimulation";

import type { TrafficSnapshot } from "./trafficSimulation";

type PlayerTrafficInfo = {
    x: number;
    z: number;
    siren: boolean;
};

type Props = {
    paused?: boolean;
    playerRef?: RefObject<PlayerTrafficInfo>;
};

type Route = {
    points: readonly (readonly [number, number])[];
    lengths: number[];
    perimeter: number;
};

type CarConfig = {
    id: string;
    kind: VehicleKind;
    color: string;
    route: number;
    progress: number;
    speed: number;
    targetSpeed: number;
};

// All waypoints lie on the existing road network.
// The old decorative roundabout is avoided.

const PATHS: readonly (
    readonly (readonly [number, number])[]
)[] = [
        // Outer district
        [
            [-14.15, -14.15],
            [-14.15, 14.15],
            [14.15, 14.15],
            [14.15, -14.15],
        ],

        // Central district
        [
            [-6.65, -6.65],
            [-6.65, 6.65],
            [6.65, 6.65],
            [6.65, -6.65],
        ],

        // Eastern district
        [
            [0.85, 0.85],
            [0.85, 14.15],
            [14.15, 14.15],
            [14.15, 0.85],
        ],
    ];


function makeRoute(
    points: readonly (readonly [number, number])[]
): Route {
    const lengths = points.map((point, index) => {
        const next = points[(index + 1) % points.length];

        return Math.hypot(
            next[0] - point[0],
            next[1] - point[1]
        );
    });

    return {
        points,
        lengths,
        perimeter: lengths.reduce(
            (sum, value) => sum + value,
            0
        ),
    };
}

const ROUTES = PATHS.map(makeRoute);

const INITIAL_CARS: Omit<CarConfig, "speed">[] = [
    {
        id: "taxi-a",
        kind: "taxi",
        color: "#FFC93C",
        route: 0,
        progress: 4,
        targetSpeed: 3.7,
    },
    {
        id: "sedan-a",
        kind: "sedan",
        color: "#FF8F7A",
        route: 0,
        progress: 19,
        targetSpeed: 4.2,
    },
    {
        id: "delivery-a",
        kind: "delivery",
        color: "#F4F2E8",
        route: 0,
        progress: 37,
        targetSpeed: 3.2,
    },
    {
        id: "bus-a",
        kind: "bus",
        color: "#2EC4B6",
        route: 0,
        progress: 57,
        targetSpeed: 2.8,
    },
    {
        id: "hatch-a",
        kind: "hatchback",
        color: "#C3B2EB",
        route: 0,
        progress: 77,
        targetSpeed: 4.1,
    },
    {
        id: "utility-a",
        kind: "utility",
        color: "#78B8A6",
        route: 0,
        progress: 97,
        targetSpeed: 3.5,
    },
    {
        id: "taxi-b",
        kind: "taxi",
        color: "#FFD35B",
        route: 1,
        progress: 4,
        targetSpeed: 3.1,
    },
    {
        id: "sedan-b",
        kind: "sedan",
        color: "#C4D5F3",
        route: 1,
        progress: 19,
        targetSpeed: 3.6,
    },
    {
        id: "hatch-b",
        kind: "hatchback",
        color: "#E5A9BA",
        route: 1,
        progress: 37,
        targetSpeed: 3.2,
    },
    {
        id: "delivery-b",
        kind: "delivery",
        color: "#F2D8BB",
        route: 2,
        progress: 4,
        targetSpeed: 3.2,
    },
    {
        id: "sedan-c",
        kind: "sedan",
        color: "#8FD5CC",
        route: 2,
        progress: 24,
        targetSpeed: 3.7,
    },
    {
        id: "taxi-c",
        kind: "taxi",
        color: "#F8C94D",
        route: 2,
        progress: 44,
        targetSpeed: 3.4,
    },
];

function sampleRoute(
    route: Route,
    travel: number
): {
    x: number;
    z: number;
    yaw: number;
} {
    let remaining =
        ((travel % route.perimeter) + route.perimeter) %
        route.perimeter;

    for (let i = 0; i < route.points.length; i++) {
        const segmentLength = route.lengths[i];

        if (
            remaining <= segmentLength ||
            i === route.points.length - 1
        ) {
            const a = route.points[i];
            const b =
                route.points[(i + 1) % route.points.length];

            const t = THREE.MathUtils.clamp(
                remaining / segmentLength,
                0,
                1
            );

            return {
                x: THREE.MathUtils.lerp(a[0], b[0], t),
                z: THREE.MathUtils.lerp(a[1], b[1], t),
                yaw: Math.atan2(
                    b[0] - a[0],
                    b[1] - a[1]
                ),
            };
        }

        remaining -= segmentLength;
    }

    return { x: 0, z: 0, yaw: 0 };
}

function getSnapshot(car: CarConfig): TrafficSnapshot {
    const pos = sampleRoute(
        ROUTES[car.route],
        car.progress
    );

    return {
        id: car.id,
        x: pos.x,
        z: pos.z,
        yaw: pos.yaw,
        speed: car.speed,
        kind: car.kind,
    };
}

function getSnapshots(
    cars: readonly CarConfig[]
): TrafficSnapshot[] {
    return cars.map(getSnapshot);
}

/**
 * Test whether a candidate position is occupied.
 *
 * Checks other NPCs AND the player's ambulance.
 */
function positionBlocked(
    candidate: TrafficSnapshot,
    otherCars: readonly TrafficSnapshot[],
    player?: PlayerTrafficInfo
): boolean {
    if (npcWouldCollide(candidate, otherCars, 0.12)) {
        return true;
    }

    if (player) {
        // Approximate the ambulance as a circle.
        // Include an additional margin so NPCs stop before impact.
        const playerRadius = player.siren ? 1.1 : 0.86;

        if (
            circleHitsVehicle(
                { x: player.x, z: player.z },
                playerRadius,
                candidate,
                0.08
            )
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Look along the actual route rather than just checking
 * distances between cars at their current positions.
 */
function forwardClearance(
    car: CarConfig,
    otherCars: readonly TrafficSnapshot[],
    player?: PlayerTrafficInfo
): number {
    const route = ROUTES[car.route];

    // More warning distance for large vehicles.
    const vehicleLength = vehicleRadius(car.kind);
    const lookAhead = 6 + vehicleLength;

    // Short increments make detection consistent at corners.
    const step = 0.4;

    for (
        let distanceAhead = step;
        distanceAhead <= lookAhead;
        distanceAhead += step
    ) {
        const position = sampleRoute(
            route,
            car.progress + distanceAhead
        );

        const candidate: TrafficSnapshot = {
            id: car.id,
            x: position.x,
            z: position.z,
            yaw: position.yaw,
            speed: car.speed,
            kind: car.kind,
        };

        if (
            positionBlocked(
                candidate,
                otherCars,
                player
            )
        ) {
            return distanceAhead;
        }
    }

    return Infinity;
}

/**
 * This measures gaps along the current route, avoiding
 * the problem where cars on opposite sides of a block
 * get mistaken for cars directly ahead.
 */
function sameRouteClearance(
    car: CarConfig,
    cars: readonly CarConfig[]
): number {
    const route = ROUTES[car.route];
    let nearest = Infinity;

    for (const other of cars) {
        if (
            other.id === car.id ||
            other.route !== car.route
        ) {
            continue;
        }

        const gap =
            (other.progress - car.progress + route.perimeter) %
            route.perimeter;

        nearest = Math.min(nearest, gap);
    }

    return nearest;
}

export default function CityTraffic({
    paused = false,
    playerRef,
}: Props) {
    const groups = useRef<
        Record<string, THREE.Group | null>
    >({});

    const cars = useRef<CarConfig[]>(
        INITIAL_CARS.map((config) => ({
            ...config,
            speed: 0,
        }))
    );

    useEffect(() => {
        // Publish positions immediately after mounting.
        updateTrafficSnapshots(getSnapshots(cars.current));

        return () => {
            clearTrafficSnapshots();
        };
    }, []);

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt, 0.045);
        const player = playerRef?.current;

        if (!paused) {
            const previousCars = cars.current;

            const previousSnapshots =
                getSnapshots(previousCars);

            // Update longer vehicles and leading cars
            // using the same shared positions.
            const nextCars = previousCars.map(
                (item) => ({ ...item })
            );

            const committedSnapshots =
                [...previousSnapshots];

            for (const car of nextCars) {
                const route = ROUTES[car.route];

                const otherCars =
                    committedSnapshots.filter(
                        (item) => item.id !== car.id
                    );

                const ahead = forwardClearance(
                    car,
                    otherCars,
                    player
                );

                const laneGap = sameRouteClearance(
                    car,
                    nextCars
                );

                let desiredSpeed = car.targetSpeed;

                // Road-speed regulation based on available space.
                if (ahead < 1.1 || laneGap < 2.4) {
                    desiredSpeed = 0;
                } else {
                    if (Number.isFinite(ahead)) {
                        desiredSpeed = Math.min(
                            desiredSpeed,
                            Math.max(0, (ahead - 1.1) * 1.45)
                        );
                    }

                    if (Number.isFinite(laneGap)) {
                        desiredSpeed = Math.min(
                            desiredSpeed,
                            Math.max(0, (laneGap - 2.4) * 1.2)
                        );
                    }
                }

                // Vehicles ahead of an emergency ambulance
                // stop earlier to leave a safe gap.
                if (player?.siren) {
                    const pos = sampleRoute(
                        route,
                        car.progress
                    );

                    const distanceToPlayer = Math.hypot(
                        pos.x - player.x,
                        pos.z - player.z
                    );

                    if (
                        distanceToPlayer < 5 &&
                        Number.isFinite(ahead) &&
                        ahead < 5
                    ) {
                        desiredSpeed = 0;
                    }
                }

                // Braking must be faster than acceleration.
                const response =
                    desiredSpeed < car.speed ? 9 : 2.2;

                const newSpeed = THREE.MathUtils.damp(
                    car.speed,
                    desiredSpeed,
                    response,
                    dt
                );

                const proposedProgress =
                    (car.progress + newSpeed * dt) %
                    route.perimeter;

                const proposedPosition =
                    sampleRoute(route, proposedProgress);

                const proposedSnapshot: TrafficSnapshot = {
                    id: car.id,
                    x: proposedPosition.x,
                    z: proposedPosition.z,
                    yaw: proposedPosition.yaw,
                    speed: newSpeed,
                    kind: car.kind,
                };

                // Last-resort collision prevention:
                // do not advance into occupied space.
                if (
                    positionBlocked(
                        proposedSnapshot,
                        otherCars,
                        player
                    )
                ) {
                    car.speed = 0;
                } else {
                    car.speed = newSpeed;
                    car.progress = proposedProgress;
                }

                // Later vehicles read the newly committed position.
                const snapshotIndex =
                    committedSnapshots.findIndex(
                        (item) => item.id === car.id
                    );

                if (snapshotIndex !== -1) {
                    committedSnapshots[snapshotIndex] =
                        getSnapshot(car);
                }
            }

            cars.current = nextCars;
        }

        const snapshots = getSnapshots(cars.current);

        for (const car of cars.current) {
            const position = sampleRoute(
                ROUTES[car.route],
                car.progress
            );

            const group = groups.current[car.id];

            if (!group) continue;

            group.position.set(
                position.x,
                0.075,
                position.z
            );

            group.rotation.y = position.yaw;
        }

        // The player checks these positions on its own frame.
        updateTrafficSnapshots(snapshots);
    }, -1);

    return (
        <group>
            {INITIAL_CARS.map((car) => {
                const initial = sampleRoute(
                    ROUTES[car.route],
                    car.progress
                );

                return (
                    <group
                        key={car.id}
                        ref={(element) => {
                            groups.current[car.id] = element;
                        }}
                        position={[
                            initial.x,
                            0.075,
                            initial.z,
                        ]}
                        rotation={[0, initial.yaw, 0]}
                    >
                        <Vehicle
                            kind={car.kind}
                            color={car.color}
                        />
                    </group>
                );
            })}
        </group>
    );
}
