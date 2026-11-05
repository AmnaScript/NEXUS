
import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
    CITY,
    ROAD_INTERSECTIONS,
} from "./cityLayout";

import {
    getSignalForAxis,
    type SignalColor,
    type TravelAxis,
} from "../vehicles/trafficRules";

export type TrafficClockState = {
    seconds: number;
};

type Props = {
    timeRef: RefObject<TrafficClockState>;
};

const COLORS: Record<SignalColor, string> = {
    red: "#FF5A4E",
    yellow: "#FFC93C",
    green: "#3DBE7A",
};

const LIGHT_ORDER: SignalColor[] = [
    "red",
    "yellow",
    "green",
];

function SignalHead({
    x,
    z,
    axis,
    timeRef,
}: {
    x: number;
    z: number;
    axis: TravelAxis;
    timeRef: RefObject<TrafficClockState>;
}) {
    const materials = useRef<
        Partial<Record<SignalColor, THREE.MeshStandardMaterial>>
    >({});

    const lastColor = useRef<SignalColor | null>(null);

    useFrame(() => {
        const current = getSignalForAxis(
            timeRef.current.seconds,
            x,
            z,
            axis
        );

        if (current === lastColor.current) return;
        lastColor.current = current;

        for (const color of LIGHT_ORDER) {
            const material = materials.current[color];

            if (!material) continue;

            const active = current === color;

            material.color.set(
                active ? COLORS[color] : "#39434C"
            );

            material.emissive.set(
                active ? COLORS[color] : "#000000"
            );

            material.emissiveIntensity = active ? 1.9 : 0;
        }
    });

    const offset = CITY.roadWidth / 2 + 0.3;

    const px = x + (axis === "NS" ? offset : -offset);
    const pz = z + (axis === "NS" ? -offset : offset);

    return (
        <group position={[px, 0.17, pz]}>
            {/* Post */}
            <mesh position={[0, 0.98, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.045, 1.96, 8]} />
                <meshStandardMaterial color="#435263" />
            </mesh>

            {/* Signal housing */}
            <mesh position={[0, 2.12, 0]} castShadow>
                <boxGeometry args={[0.3, 0.77, 0.28]} />
                <meshStandardMaterial color="#25323C" />
            </mesh>

            {/* Visible signal lamps on both faces */}
            {LIGHT_ORDER.map((color, index) => (
                <group key={color}>
                    <mesh
                        position={[
                            0,
                            2.34 - index * 0.23,
                            0.155,
                        ]}
                    >
                        <sphereGeometry args={[0.073, 12, 8]} />
                        <meshStandardMaterial
                            ref={(material) => {
                                if (material) {
                                    materials.current[color] = material;
                                }
                            }}
                            color="#39434C"
                            emissive="#000000"
                            emissiveIntensity={0}
                        />
                    </mesh>

                    <mesh
                        position={[
                            0,
                            2.34 - index * 0.23,
                            -0.155,
                        ]}
                    >
                        <sphereGeometry args={[0.073, 12, 8]} />
                        <meshStandardMaterial
                            color={COLORS[color]}
                            emissive={COLORS[color]}
                            emissiveIntensity={0.13}
                        />
                    </mesh>
                </group>
            ))}

            {/* Directional arm */}
            <mesh
                position={[axis === "NS" ? -0.22 : 0.22, 1.91, 0]}
            >
                <boxGeometry args={[0.44, 0.045, 0.045]} />
                <meshStandardMaterial color="#435263" />
            </mesh>
        </group>
    );
}

export default function TrafficSignals({ timeRef }: Props) {
    return (
        <group>
            {ROAD_INTERSECTIONS.map(([x, z]) => (
                <group key={`${x}-${z}`}>
                    <SignalHead
                        x={x}
                        z={z}
                        axis="NS"
                        timeRef={timeRef}
                    />
                    <SignalHead
                        x={x}
                        z={z}
                        axis="EW"
                        timeRef={timeRef}
                    />
                </group>
            ))}
        </group>
    );
}
