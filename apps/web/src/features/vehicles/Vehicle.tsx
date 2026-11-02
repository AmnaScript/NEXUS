
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export type VehicleKind =
    | "sedan"
    | "hatchback"
    | "taxi"
    | "bus"
    | "delivery"
    | "ambulance"
    | "firetruck"
    | "police"
    | "utility";

type Props = {
    kind: VehicleKind;
    color?: string;
    lightsOn?: boolean;
    sirenOn?: boolean;
};

const DEFAULT_COLORS: Record<VehicleKind, string> = {
    sedan: "#FF8F7A",
    hatchback: "#FFC93C",
    taxi: "#F6BD38",
    bus: "#2EC4B6",
    delivery: "#F6F2E7",
    ambulance: "#FFFDF5",
    firetruck: "#E84B42",
    police: "#F8FAFC",
    utility: "#5CA9B0",
};

function Body({
    at,
    size,
    color,
    radius = 0.12,
}: {
    at: [number, number, number];
    size: [number, number, number];
    color: string;
    radius?: number;
}) {
    return (
        <RoundedBox position={at} args={size} radius={radius} smoothness={3} castShadow>
            <meshStandardMaterial color={color} metalness={0.13} roughness={0.48} />
        </RoundedBox>
    );
}

function Wheel({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0.22, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.21, 0.21, 0.13, 18]} />
                <meshStandardMaterial color="#242A36" roughness={0.91} />
            </mesh>
            <mesh
                rotation={[0, 0, Math.PI / 2]}
                position={[x > 0 ? 0.07 : -0.07, 0, 0]}
            >
                <cylinderGeometry args={[0.105, 0.105, 0.008, 12]} />
                <meshStandardMaterial color="#C7D1D2" metalness={0.65} roughness={0.3} />
            </mesh>
        </group>
    );
}

function LightBar({ active }: { active: boolean }) {
    const red = useRef<THREE.MeshStandardMaterial>(null);
    const blue = useRef<THREE.MeshStandardMaterial>(null);

    useFrame(({ clock }) => {
        const flash = Math.floor(clock.elapsedTime * 5) % 2 === 0;

        if (red.current) red.current.emissiveIntensity = active && flash ? 3 : 0.15;
        if (blue.current) blue.current.emissiveIntensity = active && !flash ? 3 : 0.15;
    });

    return (
        <group position={[0, 1.43, -0.25]}>
            <Body at={[0, 0, 0]} size={[0.64, 0.06, 0.25]} color="#344659" />
            <mesh position={[-0.17, 0.048, 0]}>
                <boxGeometry args={[0.27, 0.13, 0.19]} />
                <meshStandardMaterial ref={red} color="#FF554D" emissive="#FF554D" />
            </mesh>
            <mesh position={[0.17, 0.048, 0]}>
                <boxGeometry args={[0.27, 0.13, 0.19]} />
                <meshStandardMaterial ref={blue} color="#4AA8FF" emissive="#4AA8FF" />
            </mesh>
        </group>
    );
}

export default function Vehicle({
    kind,
    color,
    lightsOn = false,
    sirenOn = false,
}: Props) {
    const paint = color ?? DEFAULT_COLORS[kind];
    const isBus = kind === "bus";
    const isTruck = kind === "firetruck";
    const isVan = ["delivery", "ambulance", "utility"].includes(kind);
    const isEmergency = ["ambulance", "firetruck", "police"].includes(kind);
    const length = isBus ? 3.05 : isTruck ? 2.7 : isVan ? 2.12 : 1.55;
    const width = isBus || isTruck ? 1.02 : 0.91;
    const cabinHeight = isBus ? 0.97 : isTruck ? 0.79 : isVan ? 0.83 : 0.55;
    const wheelZ = length * 0.34;

    return (
        <group>
            {/* Chassis */}
            <Body
                at={[0, 0.46, 0]}
                size={[width, 0.43, length]}
                color={paint}
                radius={0.15}
            />

            {/* Separate raised cabin and windscreen */}
            <Body
                at={[0, 0.79 + cabinHeight * 0.22, isBus ? 0 : -length * 0.13]}
                size={[
                    width * 0.88,
                    cabinHeight,
                    isBus ? length * 0.88 : isTruck ? 0.94 : isVan ? length * 0.84 : 0.9,
                ]}
                color={isBus ? "#A7E7E6" : isVan || isTruck ? paint : "#A9DCE5"}
                radius={0.12}
            />

            <Body
                at={[0, 0.96, isBus ? length * 0.41 : isTruck ? 0.36 : length * 0.18]}
                size={[width * 0.72, 0.39, 0.055]}
                color="#6AB2C4"
                radius={0.02}
            />

            {/* Side windows, mirrors and wheels */}
            {[-1, 1].map((side) => (
                <group key={side}>
                    <Body
                        at={[
                            side * width * 0.455,
                            isBus ? 1.11 : 1.02,
                            isTruck ? -0.66 : -0.16,
                        ]}
                        size={[
                            0.04,
                            0.33,
                            isBus ? 2.25 : isVan ? 1.15 : isTruck ? 0.65 : 0.57,
                        ]}
                        color="#86C8D7"
                        radius={0.015}
                    />

                    <Body
                        at={[side * (width * 0.56), 0.85, length * 0.25]}
                        size={[0.16, 0.13, 0.24]}
                        color="#354657"
                        radius={0.025}
                    />

                    <Wheel x={side * (width * 0.52)} z={wheelZ} />
                    <Wheel x={side * (width * 0.52)} z={-wheelZ} />

                    <Body
                        at={[side * width * 0.3, 0.48, length / 2 + 0.018]}
                        size={[0.18, 0.13, 0.045]}
                        color={lightsOn ? "#FFEDAF" : "#EFE5C5"}
                        radius={0.02}
                    />
                    <Body
                        at={[side * width * 0.3, 0.48, -length / 2 - 0.018]}
                        size={[0.18, 0.13, 0.045]}
                        color="#EA665D"
                        radius={0.02}
                    />
                </group>
            ))}

            {/* Front bumper */}
            <Body
                at={[0, 0.31, length / 2 + 0.04]}
                size={[width * 0.88, 0.16, 0.11]}
                color="#344454"
                radius={0.035}
            />

            {kind === "taxi" && (
                <Body
                    at={[0, 1.4, -0.14]}
                    size={[0.5, 0.19, 0.24]}
                    color="#FFF9E9"
                    radius={0.04}
                />
            )}

            {kind === "ambulance" && (
                <>
                    <Body at={[0, 1.47, -0.45]} size={[0.35, 0.09, 0.4]} color="#FF5A4E" />
                    <Body at={[0, 1.48, -0.45]} size={[0.12, 0.1, 0.65]} color="#FF5A4E" />
                </>
            )}

            {kind === "firetruck" && (
                <group position={[0, 1.6, -0.55]}>
                    {[-0.29, 0.29].map((x) => (
                        <mesh key={x} position={[x, 0, 0]}>
                            <boxGeometry args={[0.075, 0.08, 1.45]} />
                            <meshStandardMaterial color="#E7E8DD" metalness={0.6} />
                        </mesh>
                    ))}
                    {Array.from({ length: 6 }, (_, i) => (
                        <mesh key={i} position={[0, 0, -0.62 + i * 0.25]}>
                            <boxGeometry args={[0.65, 0.065, 0.065]} />
                            <meshStandardMaterial color="#E7E8DD" />
                        </mesh>
                    ))}
                </group>
            )}

            {kind === "police" && (
                <Body
                    at={[0, 0.53, 0]}
                    size={[width + 0.015, 0.16, length * 0.72]}
                    color="#344A71"
                />
            )}

            {isEmergency && <LightBar active={sirenOn} />}
        </group>
    );
}
