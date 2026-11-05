
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
} from "./trafficSimulation";

import type { TrafficSnapshot } from "./trafficSimulation";
import type { TrafficClockState } from "../city-world/TrafficSignals";

import {
    INTERSECTION_APPROACH,
    STOP_LINE_DISTANCE,
    canEnterIntersection,
    closestRoad,
    getAxisFromDirection,
} from "./trafficRules";

type PlayerInfo = {
    x: number;
    z: number;
    siren: boolean;
};

type Props = {
    paused?: boolean;
    playerRef?: RefObject<PlayerInfo>;
    timeRef: RefObject<TrafficClockState>;
};

type Point = readonly [number, number];

type Route = {
    points: readonly Point[];
    lengths: number[];
    total: number;
};

type Car = {
    id: string;
    kind: VehicleKind;
    color: string;
    route: number;
    progress: number;
    speed: number;
    cruisingSpeed: number;
};

type RouteSample = {
    x: number;
    z: number;
    yaw: number;
    segment: number;
    distanceToCorner: number;
};

const PATHS: readonly (readonly Point[])[] = [
    [
        [-14.15, -14.15],
        [-14.15, 14.15],
        [14.15, 14.15],
        [14.15, -14.15],
    ],
    [
        [-6.65, -6.65],
        [-6.65, 6.65],
        [6.65, 6.65],
        [6.65, -6.65],
    ],
    [
        [0.85, 0.85],
        [0.85, 14.15],
        [14.15, 14.15],
        [14.15, 0.85],
    ],
];

function createRoute(points: readonly Point[]): Route {
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
        total: lengths.reduce((sum, item) => sum + item, 0),
    };
}

const ROUTES = PATHS.map(createRoute);

const CAR_DEFINITIONS: Omit<Car, "speed">[] = [
    { id: "taxi-01", kind: "taxi", color: "#FFC93C", route: 0, progress: 4, cruisingSpeed: 3.5 },
    { id: "sedan-01", kind: "sedan", color: "#FF8F7A", route: 0, progress: 21, cruisingSpeed: 3.8 },
    { id: "delivery-01", kind: "delivery", color: "#F3F0E8", route: 0, progress: 40, cruisingSpeed: 3.0 },
    { id: "bus-01", kind: "bus", color: "#2EC4B6", route: 0, progress: 62, cruisingSpeed: 2.7 },
    { id: "hatch-01", kind: "hatchback", color: "#C5B3E9", route: 0, progress: 82, cruisingSpeed: 3.7 },
    { id: "utility-01", kind: "utility", color: "#8FC8BD", route: 0, progress: 103, cruisingSpeed: 3.1 },

    { id: "taxi-02", kind: "taxi", color: "#FFD35B", route: 1, progress: 4, cruisingSpeed: 3.0 },
    { id: "sedan-02", kind: "sedan", color: "#C4D5F3", route: 1, progress: 20, cruisingSpeed: 3.5 },
    { id: "hatch-02", kind: "hatchback", color: "#E5A9BA", route: 1, progress: 38, cruisingSpeed: 3.1 },

    { id: "delivery-02", kind: "delivery", color: "#F2D8BB", route: 2, progress: 4, cruisingSpeed: 3.0 },
    { id: "sedan-03", kind: "sedan", color: "#8FD5CC", route: 2, progress: 24, cruisingSpeed: 3.5 },
    { id: "taxi-03", kind: "taxi", color: "#F8C94D", route: 2, progress: 44, cruisingSpeed: 3.2 },
];

function sampleRoute(
    route: Route,
    progress: number
): RouteSample {
    let remaining =
        ((progress % route.total) + route.total) %
        route.total;

    for (let i = 0; i < route.points.length; i++) {
        const length = route.lengths[i];

        if (
            remaining <= length ||
            i === route.points.length - 1
        ) {
            const from = route.points[i];
            const to =
                route.points[(i + 1) % route.points.length];

            const t = THREE.MathUtils.clamp(
                remaining / length,
                0,
                1
            );

            return {
                x: THREE.MathUtils.lerp(from[0], to[0], t),
                z: THREE.MathUtils.lerp(from[1], to[1], t),
                yaw: Math.atan2(
                    to[0] - from[0],
                    to[1] - from[1]
                ),
                segment: i,
                distanceToCorner: length - remaining,
            };
        }

        remaining -= length;
    }

    return {
        x: 0,
        z: 0,
        yaw: 0,
        segment: 0,
        distanceToCorner: 0,
    };
}

function snapshot(car: Car): TrafficSnapshot {
    const sampled = sampleRoute(
        ROUTES[car.route],
        car.progress
    );

    return {
        id: car.id,
        kind: car.kind,
        x: sampled.x,
        z: sampled.z,
        yaw: sampled.yaw,
        speed: car.speed,
    };
}

function snapshots(cars: readonly Car[]): TrafficSnapshot[] {
    return cars.map(snapshot);
}

function isBlocked(
    candidate: TrafficSnapshot,
    otherVehicles: readonly TrafficSnapshot[],
    player?: PlayerInfo
): boolean {
    if (npcWouldCollide(candidate, otherVehicles, 0.12)) {
        return true;
    }

    if (!player) return false;

    return circleHitsVehicle(
        { x: player.x, z: player.z },
        player.siren ? 1.12 : 0.91,
        candidate,
        0.12
    );
}

function clearanceAhead(
    car: Car,
    otherVehicles: readonly TrafficSnapshot[],
    player?: PlayerInfo
): number {
    const route = ROUTES[car.route];

    for (let ahead = 0.35; ahead <= 7.5; ahead += 0.35) {
        const next = sampleRoute(
            route,
            car.progress + ahead
        );

        const candidate: TrafficSnapshot = {
            id: car.id,
            kind: car.kind,
            x: next.x,
            z: next.z,
            yaw: next.yaw,
            speed: car.speed,
        };

        if (isBlocked(candidate, otherVehicles, player)) {
            return ahead;
        }
    }

    return Infinity;
}

function sameLaneGap(
    car: Car,
    cars: readonly Car[]
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
            (other.progress - car.progress + route.total) %
            route.total;

        nearest = Math.min(nearest, gap);
    }

    return nearest;
}

function trafficLightSpeedLimit(
    car: Car,
    seconds: number
): number {
    const route = ROUTES[car.route];
    const position = sampleRoute(route, car.progress);

    if (
        position.distanceToCorner >
        INTERSECTION_APPROACH
    ) {
        return car.cruisingSpeed;
    }

    const from = route.points[position.segment];
    const next =
        route.points[
        (position.segment + 1) % route.points.length
        ];

    const axis = getAxisFromDirection(
        next[0] - from[0],
        next[1] - from[1]
    );

    const junctionX = closestRoad(next[0]);
    const junctionZ = closestRoad(next[1]);

    if (
        canEnterIntersection(
            seconds,
            junctionX,
            junctionZ,
            axis
        )
    ) {
        return car.cruisingSpeed;
    }

    const distanceToStop =
        position.distanceToCorner - STOP_LINE_DISTANCE;

    if (distanceToStop <= 0) {
        return 0;
    }

    // Smooth approach rather than an instant stop.
    return Math.min(
        car.cruisingSpeed,
        Math.max(0, distanceToStop * 1.4)
    );
}

export default function CityTraffic({
    paused = false,
    playerRef,
    timeRef,
}: Props) {
    const vehicles = useRef<Car[]>(
        CAR_DEFINITIONS.map((config) => ({
            ...config,
            speed: 0,
        }))
    );

    const meshes = useRef<
        Record<string, THREE.Group | null>
    >({});

    useEffect(() => {
        updateTrafficSnapshots(snapshots(vehicles.current));

        return () => {
            clearTrafficSnapshots();
        };
    }, []);

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt, 0.045);
        const player = playerRef?.current;

        if (!paused) {
            const previous = vehicles.current;
            const next = previous.map((car) => ({ ...car }));
            const committed = snapshots(previous);

            for (const car of next) {
                const otherVehicles = committed.filter(
                    (item) => item.id !== car.id
                );

                const ahead = clearanceAhead(
                    car,
                    otherVehicles,
                    player
                );

                const laneGap = sameLaneGap(car, next);

                let desiredSpeed = trafficLightSpeedLimit(
                    car,
                    timeRef.current.seconds
                );

                // Avoid vehicles in front, including cross-traffic.
                if (ahead < 1.1 || laneGap < 2.4) {
                    desiredSpeed = 0;
                } else {
                    if (Number.isFinite(ahead)) {
                        desiredSpeed = Math.min(
                            desiredSpeed,
                            Math.max(0, (ahead - 1.1) * 1.5)
                        );
                    }

                    if (Number.isFinite(laneGap)) {
                        desiredSpeed = Math.min(
                            desiredSpeed,
                            Math.max(0, (laneGap - 2.4) * 1.2)
                        );
                    }
                }

                // Emergency vehicle priority.
                if (player?.siren) {
                    const position = sampleRoute(
                        ROUTES[car.route],
                        car.progress
                    );

                    const distanceToAmbulance = Math.hypot(
                        position.x - player.x,
                        position.z - player.z
                    );

                    if (distanceToAmbulance < 4.2) {
                        desiredSpeed = 0;
                    }
                }

                // Separate acceleration and braking.
                const response =
                    desiredSpeed < car.speed ? 9 : 2.5;

                const proposedSpeed = THREE.MathUtils.damp(
                    car.speed,
                    desiredSpeed,
                    response,
                    dt
                );

                const proposedProgress =
                    (car.progress + proposedSpeed * dt) %
                    ROUTES[car.route].total;

                const sampled = sampleRoute(
                    ROUTES[car.route],
                    proposedProgress
                );

                const candidate: TrafficSnapshot = {
                    id: car.id,
                    kind: car.kind,
                    x: sampled.x,
                    z: sampled.z,
                    yaw: sampled.yaw,
                    speed: proposedSpeed,
                };

                if (
                    isBlocked(candidate, otherVehicles, player)
                ) {
                    car.speed = 0;
                } else {
                    car.speed = proposedSpeed;
                    car.progress = proposedProgress;
                }

                const index = committed.findIndex(
                    (item) => item.id === car.id
                );

                if (index !== -1) {
                    committed[index] = snapshot(car);
                }
            }

            vehicles.current = next;
        }

        const current = snapshots(vehicles.current);

        for (const car of vehicles.current) {
            const mesh = meshes.current[car.id];
            if (!mesh) continue;

            const point = sampleRoute(
                ROUTES[car.route],
                car.progress
            );

            mesh.position.set(point.x, 0.075, point.z);
            mesh.rotation.y = point.yaw;
        }

        updateTrafficSnapshots(current);
    }, -1);

    return (
        <group>
            {CAR_DEFINITIONS.map((car) => {
                const initial = sampleRoute(
                    ROUTES[car.route],
                    car.progress
                );

                return (
                    <group
                        key={car.id}
                        ref={(element) => {
                            meshes.current[car.id] = element;
                        }}
                        position={[initial.x, 0.075, initial.z]}
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
