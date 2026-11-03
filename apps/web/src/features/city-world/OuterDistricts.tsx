
import { RoundedBox, Text } from "@react-three/drei";
import { BLOCK_CENTERS } from "./cityLayout";

type Vec3 = [number, number, number];

function Box({
    at,
    size,
    color,
}: {
    at: Vec3;
    size: Vec3;
    color: string;
}) {
    return (
        <RoundedBox
            position={at}
            args={size}
            radius={0.05}
            smoothness={2}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial color={color} roughness={0.8} />
        </RoundedBox>
    );
}

const COLORS = [
    "#F5B19A",
    "#94CFBF",
    "#FFCF7B",
    "#B5D5E5",
    "#CDB9DE",
    "#C9D4AA",
] as const;

function NeighborhoodBuilding({
    x,
    z,
    index,
}: {
    x: number;
    z: number;
    index: number;
}) {
    const tower = index % 6 === 0;
    const shop = !tower && index % 4 === 0;

    const height = tower
        ? 6.4
        : shop
            ? 2.75
            : 2.25 + (index % 3) * 0.48;

    const width = tower ? 2.62 : 2.9;
    const depth = tower ? 2.65 : 2.85;
    const floors = Math.max(2, Math.floor(height / 0.79));

    return (
        <group position={[x, 0.18, z]}>
            <Box
                at={[0, height / 2, 0]}
                size={[width, height, depth]}
                color={COLORS[index % COLORS.length]}
            />

            <Box
                at={[0, height + 0.095, 0]}
                size={[width + 0.16, 0.19, depth + 0.16]}
                color="#FFF9EA"
            />

            {Array.from({ length: floors }, (_, row) => {
                const y =
                    0.69 + row * ((height - 0.87) / floors);

                return [-0.85, -0.28, 0.28, 0.85].map(
                    (offset) => (
                        <group key={`${row}-${offset}`}>
                            <Box
                                at={[offset, y, depth / 2 + 0.035]}
                                size={[0.32, 0.34, 0.045]}
                                color="#91CBD5"
                            />
                            <Box
                                at={[offset, y, -depth / 2 - 0.035]}
                                size={[0.32, 0.34, 0.045]}
                                color="#91CBD5"
                            />
                            <Box
                                at={[width / 2 + 0.035, y, offset]}
                                size={[0.045, 0.34, 0.32]}
                                color="#91CBD5"
                            />
                            <Box
                                at={[-width / 2 - 0.035, y, offset]}
                                size={[0.045, 0.34, 0.32]}
                                color="#91CBD5"
                            />
                        </group>
                    )
                );
            })}

            <Box
                at={[0, 0.48, depth / 2 + 0.065]}
                size={[0.63, 0.95, 0.1]}
                color="#395E70"
            />

            <Box
                at={[0, 1.02, depth / 2 + 0.24]}
                size={[1.18, 0.11, 0.42]}
                color={shop ? "#FF5A4E" : "#FFFDF3"}
            />

            {shop && (
                <Text
                    position={[0, 1.39, depth / 2 + 0.045]}
                    fontSize={0.18}
                    color="#1B1F3B"
                    anchorX="center"
                    anchorY="middle"
                >
                    LOCAL STORE
                </Text>
            )}

            {tower && (
                <Box
                    at={[0.49, height + 0.37, -0.36]}
                    size={[0.59, 0.48, 0.7]}
                    color="#A2BAC0"
                />
            )}

            {/* Street-level planting, kept inside the plot */}
            <mesh position={[-1.28, 0.37, 1.31]} castShadow>
                <sphereGeometry args={[0.24, 10, 8]} />
                <meshStandardMaterial color="#61B875" />
            </mesh>
        </group>
    );
}

function PocketPark({
    x,
    z,
}: {
    x: number;
    z: number;
}) {
    return (
        <group position={[x, 0.18, z]}>
            <Box
                at={[0, 0.045, 0]}
                size={[3.5, 0.09, 3.5]}
                color="#91CB81"
            />

            <Box
                at={[0, 0.105, 0]}
                size={[0.39, 0.04, 3.4]}
                color="#F2E0B5"
            />

            <Box
                at={[0, 0.106, 0]}
                size={[3.4, 0.04, 0.39]}
                color="#F2E0B5"
            />

            {[
                [-1.19, -1.19],
                [1.19, -1.19],
                [-1.19, 1.19],
                [1.19, 1.19],
            ].map(([tx, tz], i) => (
                <group key={i} position={[tx, 0, tz]}>
                    <mesh position={[0, 0.47, 0]}>
                        <cylinderGeometry args={[0.07, 0.09, 0.77, 7]} />
                        <meshStandardMaterial color="#81644C" />
                    </mesh>

                    <mesh position={[0, 1.08, 0]} castShadow>
                        <icosahedronGeometry args={[0.52, 1]} />
                        <meshStandardMaterial
                            color={i % 2 ? "#66BB76" : "#42A66D"}
                            flatShading
                        />
                    </mesh>
                </group>
            ))}

            <Box
                at={[1.0, 0.37, 0.8]}
                size={[0.7, 0.1, 0.26]}
                color="#B47E55"
            />
        </group>
    );
}

export default function OuterDistricts() {
    const plots = BLOCK_CENTERS.flatMap((x) =>
        BLOCK_CENTERS.map((z) => ({ x, z }))
    ).filter(
        ({ x, z }) =>
            Math.abs(x) === 18.75 ||
            Math.abs(z) === 18.75
    );

    return (
        <group>
            {plots.map(({ x, z }, index) =>
                index % 7 === 4 ? (
                    <PocketPark key={`${x}-${z}`} x={x} z={z} />
                ) : (
                    <NeighborhoodBuilding
                        key={`${x}-${z}`}
                        x={x}
                        z={z}
                        index={index}
                    />
                )
            )}
        </group>
    );
}
