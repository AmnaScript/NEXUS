
import {
    BLOCK_CENTERS,
    CITY,
    PALETTE,
    ROAD_INTERSECTIONS,
} from "./cityLayout";

type Vec3 = [number, number, number];

function Surface({
    position,
    size,
    color,
}: {
    position: Vec3;
    size: Vec3;
    color: string;
}) {
    return (
        <mesh position={position} receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} roughness={0.94} />
        </mesh>
    );
}

function Crosswalk({
    x,
    z,
    vertical,
}: {
    x: number;
    z: number;
    vertical: boolean;
}) {
    const half = CITY.roadWidth / 2;

    return (
        <group>
            {Array.from({ length: 8 }, (_, index) => {
                const offset = (index - 3.5) * 0.37;

                return (
                    <Surface
                        key={index}
                        position={
                            vertical
                                ? [x + offset, 0.065, z]
                                : [x, 0.065, z + offset]
                        }
                        size={
                            vertical
                                ? [0.23, 0.006, 0.44]
                                : [0.44, 0.006, 0.23]
                        }
                        color="#FFF9EB"
                    />
                );
            })}
            {/* The crossing is offset outside the main intersection */}
            <group position={[0, 0, 0]}>
                <mesh visible={false} position={[half, 0, 0]}>
                    <boxGeometry args={[0.01, 0.01, 0.01]} />
                    <meshBasicMaterial />
                </mesh>
            </group>
        </group>
    );
}

function RoadNetwork() {
    const dashPositions = Array.from(
        { length: 62 },
        (_, index) => -21.95 + index * 0.72
    ).filter((position) =>
        CITY.roads.every(
            (road) => Math.abs(position - road) > 2.3
        )
    );

    return (
        <group>
            {CITY.roads.map((road) => (
                <group key={road}>
                    {/* North-south */}
                    <Surface
                        position={[road, 0.026, 0]}
                        size={[CITY.roadWidth, 0.04, CITY.size]}
                        color={PALETTE.road}
                    />

                    {/* East-west */}
                    <Surface
                        position={[0, 0.027, road]}
                        size={[CITY.size, 0.04, CITY.roadWidth]}
                        color={PALETTE.road}
                    />

                    {/* Dashed centerline */}
                    {dashPositions.map((position) => (
                        <group key={`${road}-${position}`}>
                            <Surface
                                position={[road, 0.052, position]}
                                size={[0.045, 0.005, 0.36]}
                                color="#F6DDA0"
                            />

                            <Surface
                                position={[position, 0.053, road]}
                                size={[0.36, 0.005, 0.045]}
                                color="#F6DDA0"
                            />
                        </group>
                    ))}

                    {/* Road edge markings */}
                    {[-1, 1].map((side) => (
                        <group key={side}>
                            <Surface
                                position={[
                                    road + side * (CITY.roadWidth / 2 - 0.14),
                                    0.052,
                                    0,
                                ]}
                                size={[0.04, 0.004, CITY.size]}
                                color="#C5C8BE"
                            />

                            <Surface
                                position={[
                                    0,
                                    0.053,
                                    road + side * (CITY.roadWidth / 2 - 0.14),
                                ]}
                                size={[CITY.size, 0.004, 0.04]}
                                color="#C5C8BE"
                            />
                        </group>
                    ))}
                </group>
            ))}
        </group>
    );
}

function SidewalkPlots() {
    // 3.72 units fit between roads spaced 7.5 units apart.
    // This replaces the original oversized 4.9-unit slabs.
    const plotSize = 3.72;

    return (
        <group>
            {BLOCK_CENTERS.flatMap((x) =>
                BLOCK_CENTERS.map((z) => (
                    <group key={`${x}-${z}`}>
                        {/* Narrow curb / foundation */}
                        <Surface
                            position={[x, 0.112, z]}
                            size={[plotSize, 0.115, plotSize]}
                            color={PALETTE.curb}
                        />

                        {/* Warm paving instead of bright white */}
                        <Surface
                            position={[x, 0.171, z]}
                            size={[plotSize - 0.10, 0.012, plotSize - 0.10]}
                            color={PALETTE.pavement}
                        />
                    </group>
                ))
            )}
        </group>
    );
}

function StreetCrossings() {
    const offset = CITY.roadWidth / 2 + 0.37;

    return (
        <group>
            {ROAD_INTERSECTIONS.map(([x, z]) => (
                <group key={`${x}-${z}`}>
                    <Crosswalk x={x} z={z - offset} vertical />
                    <Crosswalk x={x} z={z + offset} vertical />

                    <Crosswalk x={x - offset} z={z} vertical={false} />
                    <Crosswalk x={x + offset} z={z} vertical={false} />
                </group>
            ))}
        </group>
    );
}

function CenterIsland() {
    return (
        <group position={[-7.5, 0.055, -7.5]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.75, 40]} />
                <meshStandardMaterial color="#E8D5AB" />
            </mesh>

            <mesh position={[0, 0.075, 0]}>
                <cylinderGeometry args={[0.48, 0.53, 0.13, 36]} />
                <meshStandardMaterial color="#86C47D" />
            </mesh>

            <mesh position={[0, 0.27, 0]}>
                <sphereGeometry args={[0.18, 14, 12]} />
                <meshStandardMaterial color="#FF8F7A" />
            </mesh>
        </group>
    );
}

export default function Roads() {
    return (
        <group>
            <Surface
                position={[0, -0.085, 0]}
                size={[45.5, 0.17, 45.5]}
                color="#D9D2C2"
            />

            <Surface
                position={[0, 0.006, 0]}
                size={[45, 0.012, 45]}
                color="#C9DFC0"
            />

            <RoadNetwork />
            <SidewalkPlots />
            <StreetCrossings />
            <CenterIsland />
        </group>
    );
}
