
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Vehicle from "./Vehicle";
import type { VehicleKind } from "./Vehicle";

// Every point lies on the Phase 3 road surface.
// This loop intentionally avoids the decorative roundabout.
const ROUTE: readonly [number, number][] = [
    [0.55, 0.55],
    [0.55, 6.95],
    [6.95, 6.95],
    [6.95, 0.55],
];

const SEGMENT_DURATION = 8;
const STOP_DURATION = 0.85;
const LAP_DURATION = 4 * (SEGMENT_DURATION + STOP_DURATION);

type TrafficVehicle = {
    kind: VehicleKind;
    color: string;
    offset: number;
};

const VEHICLES: TrafficVehicle[] = [
    { kind: "sedan", color: "#FF8F7A", offset: 0 },
    { kind: "taxi", color: "#FFC93C", offset: 5.1 },
    { kind: "hatchback", color: "#2EC4B6", offset: 10.2 },
    { kind: "delivery", color: "#FFFFFF", offset: 15.3 },
    { kind: "sedan", color: "#B6C7E4", offset: 20.4 },
    { kind: "utility", color: "#8FC6B9", offset: 25.5 },
];

function getPosition(time: number) {
    const localTime = ((time % LAP_DURATION) + LAP_DURATION) % LAP_DURATION;
    const segmentWithStop = SEGMENT_DURATION + STOP_DURATION;

    const segment = Math.min(
        3,
        Math.floor(localTime / segmentWithStop)
    );

    const segmentTime = localTime - segment * segmentWithStop;
    const progress = Math.min(segmentTime / SEGMENT_DURATION, 1);

    // Smooth acceleration and deceleration.
    const eased = THREE.MathUtils.smoothstep(progress, 0, 1);

    const a = ROUTE[segment];
    const b = ROUTE[(segment + 1) % ROUTE.length];

    return {
        x: THREE.MathUtils.lerp(a[0], b[0], eased),
        z: THREE.MathUtils.lerp(a[1], b[1], eased),
        rotation: Math.atan2(b[0] - a[0], b[1] - a[1]),
    };
}

function MovingVehicle({
    config,
    paused,
}: {
    config: TrafficVehicle;
    paused: boolean;
}) {
    const group = useRef<THREE.Group>(null);
    const travelTime = useRef(config.offset);

    useFrame((_, dt) => {
        if (!group.current) return;

        if (!paused) {
            travelTime.current += Math.min(dt, 0.07);
        }

        const position = getPosition(travelTime.current);

        group.current.position.set(position.x, 0.065, position.z);
        group.current.rotation.y = position.rotation;
    });

    return (
        <group ref={group}>
            <Vehicle kind={config.kind} color={config.color} />
        </group>
    );
}

export default function CityTraffic({
    paused = false,
}: {
    paused?: boolean;
}) {
    return (
        <group>
            {VEHICLES.map((config) => (
                <MovingVehicle
                    key={`${config.kind}-${config.offset}`}
                    config={config}
                    paused={paused}
                />
            ))}
        </group>
    );
}
