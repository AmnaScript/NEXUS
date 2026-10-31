import { Text } from "@react-three/drei";
type BuildingProps = {
    position: [number, number, number];
    height: number;
    width: number;
    depth: number;
    color: string;
    type: "cafe" | "apartment" | "office" | "house";
};

function Building({
    position,
    height,
    width,
    depth,
    color,
    type,
}: BuildingProps) {
    const floors = Math.floor(height);

    return (
        <group position={position}>
            {/* Main structure */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>

            {/* Roof */}
            <mesh position={[0, height + 0.1, 0]} castShadow>
                <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
                <meshStandardMaterial color="#AEBBB8" />
            </mesh>

            {/* Windows */}
            {Array.from({ length: floors }, (_, floor) =>
                [-0.45, 0.45].map((x) => (
                    <mesh
                        key={`${floor}-${x}`}
                        position={[x, floor + 0.65, depth / 2 + 0.015]}
                    >
                        <boxGeometry args={[0.38, 0.42, 0.035]} />
                        <meshStandardMaterial color="#83ACB2" />
                    </mesh>
                ))
            )}

            {/* Entrance */}
            <mesh position={[0, 0.45, depth / 2 + 0.025]}>
                <boxGeometry args={[0.65, 0.9, 0.05]} />
                <meshStandardMaterial color="#344D55" />
            </mesh>

            {/* Café awning */}
            {type === "cafe" && (
                <>
                    <mesh position={[0, 1.25, depth / 2 + 0.4]} castShadow>
                        <boxGeometry args={[width, 0.12, 0.8]} />
                        <meshStandardMaterial color="#E97B55" />
                    </mesh>

                    <mesh position={[0, 1.48, depth / 2 + 0.025]}>
                        <boxGeometry args={[1.25, 0.35, 0.05]} />
                        <meshStandardMaterial color="#FFF2D9" />
                    </mesh>
                    <Text
                        position={[0, 1.49, depth / 2 + 0.057]}
                        fontSize={0.17}
                        color="#344D55"
                        anchorX="center"
                        anchorY="middle"
                    >
                        NEXUS CAFE
                    </Text>
                </>
            )}

            {/* Apartment balcony */}
            {type === "apartment" && (
                <group position={[0, 2.2, depth / 2 + 0.3]}>
                    {/* Balcony floor */}
                    <mesh castShadow>
                        <boxGeometry args={[width * 0.75, 0.12, 0.65]} />
                        <meshStandardMaterial color="#D8E0DB" />
                    </mesh>

                    {/* Front railing */}
                    <mesh position={[0, 0.35, 0.31]}>
                        <boxGeometry args={[width * 0.75, 0.06, 0.06]} />
                        <meshStandardMaterial color="#718C8C" />
                    </mesh>

                    {/* Vertical railing bars */}
                    {[-0.55, -0.25, 0.05, 0.35, 0.55].map((x) => (
                        <mesh key={x} position={[x, 0.17, 0.31]}>
                            <boxGeometry args={[0.04, 0.35, 0.04]} />
                            <meshStandardMaterial color="#718C8C" />
                        </mesh>
                    ))}

                    {/* Side railings */}
                    {[-1, 1].map((side) => (
                        <mesh
                            key={side}
                            position={[side * width * 0.375, 0.35, 0]}
                        >
                            <boxGeometry args={[0.05, 0.06, 0.65]} />
                            <meshStandardMaterial color="#718C8C" />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Office roof equipment */}
            {type === "office" && (
                <mesh position={[0.4, height + 0.38, 0]} castShadow>
                    <boxGeometry args={[0.7, 0.55, 0.7]} />
                    <meshStandardMaterial color="#7C9294" />
                </mesh>
            )}

            {/* House chimney */}
            {type === "house" && (
                <mesh position={[0.6, height + 0.45, -0.4]} castShadow>
                    <boxGeometry args={[0.35, 0.7, 0.35]} />
                    <meshStandardMaterial color="#B87968" />
                </mesh>
            )}
        </group>
    );
}

export default function Buildings() {
    return (
        <group>
            <Building
                position={[-3.8, 0, 3.8]}
                height={1.8}
                width={2.4}
                depth={2}
                color="#EBC2AF"
                type="cafe"
            />

            <Building
                position={[-3.8, 0, -3.8]}
                height={3.5}
                width={2}
                depth={2}
                color="#DED2C6"
                type="apartment"
            />

            <Building
                position={[3.8, 0, -3.8]}
                height={4}
                width={2.3}
                depth={2.2}
                color="#B2D0CE"
                type="office"
            />

            <Building
                position={[3.8, 0, 3.8]}
                height={2.3}
                width={2.2}
                depth={2}
                color="#E1DDD0"
                type="house"
            />
        </group>
    );
}