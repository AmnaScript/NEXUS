
import { useMemo } from "react";
import {
    CITY,
    PALETTE,
    ROAD_INTERSECTIONS,
} from "./cityLayout";

function Box({
    position,
    args,
    color,
}: {
    position: [number, number, number];
    args: [number, number, number];
    color: string;
}) {
    return (
        <mesh position={position} receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} roughness={0.94} />
        </mesh>
    );
}

function RoadMarks() {
    const dashes = useMemo(
        () =>
            Array.from({ length: 41 }, (_, i) => -14.4 + i * 0.72).filter(
                (position) =>
                    CITY.roads.every((cross) => Math.abs(position - cross) > 1.6)
            ),
        []
    );

    return (
        <>
            {CITY.roads.map((road) => (
                <group key={road}>
                    {dashes.map((v) => (
                        <group key={v}>
                            <Box
                                position={[road, 0.047, v]}
                                args={[0.045, 0.005, 0.32]}
                                color="#FCE9B1"
                            />
                            <Box
                                position={[v, 0.048, road]}
                                args={[0.32, 0.005, 0.045]}
                                color="#FCE9B1"
                            />
                        </group>
                    ))}
                </group>
            ))}
        </>
    );
}

function Crosswalk({
    x,
    z,
    alongX,
}: {
    x: number;
    z: number;
    alongX: boolean;
}) {
    return (
        <group>
            {Array.from({ length: 6 }, (_, index) => {
                const offset = (index - 2.5) * 0.29;

                return (
                    <Box
                        key={index}
                        position={
                            alongX
                                ? [x + offset, 0.06, z]
                                : [x, 0.06, z + offset]
                        }
                        args={
                            alongX
                                ? [0.18, 0.006, 0.37]
                                : [0.37, 0.006, 0.18]
                        }
                        color="#FFF9E9"
                    />
                );
            })}
        </group>
    );
}

function IntersectionDetails() {
    return (
        <>
            {ROAD_INTERSECTIONS.map(([x, z]) => (
                <group key={`${x}-${z}`}>
                    <Crosswalk x={x} z={z - 1.47} alongX />
                    <Crosswalk x={x} z={z + 1.47} alongX />
                    <Crosswalk x={x - 1.47} z={z} alongX={false} />
                    <Crosswalk x={x + 1.47} z={z} alongX={false} />
                </group>
            ))}
        </>
    );
}

function Roundabout() {
    // Decorative, non-drivable center for Phase 3.
    // Phase 4 will define the actual lanes around it.
    return (
        <group position={[-7.5, 0.055, -7.5]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[0.78, 48]} />
                <meshStandardMaterial color="#F4DEAD" />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.57, 0.62, 0.12, 48]} />
                <meshStandardMaterial color="#84BF7D" />
            </mesh>
            <mesh position={[0, 0.19, 0]}>
                <cylinderGeometry args={[0.11, 0.14, 0.27, 12]} />
                <meshStandardMaterial color="#EFD7A4" />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
                <sphereGeometry args={[0.22, 16, 12]} />
                <meshStandardMaterial color="#FF8F7A" />
            </mesh>
        </group>
    );
}

export default function Roads() {
    const blockCenters = [-11.25, -3.75, 3.75, 11.25];

    return (
        <group>
            {/* Almost flush ground, no tall floating island */}
            <mesh position={[0, -0.075, 0]} receiveShadow>
                <boxGeometry args={[30.3, 0.15, 30.3]} />
                <meshStandardMaterial color="#DED7C8" />
            </mesh>

            <Box
                position={[0, 0.005, 0]}
                args={[30, 0.012, 30]}
                color="#E7E5D8"
            />

            {/* Full-length main roads */}
            {CITY.roads.map((position) => (
                <group key={position}>
                    <Box
                        position={[position, 0.025, 0]}
                        args={[CITY.roadWidth, 0.04, 30]}
                        color={PALETTE.road}
                    />
                    <Box
                        position={[0, 0.028, position]}
                        args={[30, 0.04, CITY.roadWidth]}
                        color={PALETTE.road}
                    />
                </group>
            ))}

            {/* 16 individual city plots, with generous gaps */}
            {blockCenters.flatMap((x) =>
                blockCenters.map((z) => (
                    <group key={`${x}-${z}`}>
                        <Box
                            position={[x, 0.085, z]}
                            args={[4.9, 0.16, 4.9]}
                            color={PALETTE.curb}
                        />
                        <Box
                            position={[x, 0.169, z]}
                            args={[4.67, 0.015, 4.67]}
                            color={PALETTE.pavement}
                        />
                    </group>
                ))
            )}

            <RoadMarks />
            <IntersectionDetails />
            <Roundabout />
        </group>
    );
}
