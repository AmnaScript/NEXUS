function Road({
    position,
    size,
}: {
    position: [number, number, number];
    size: [number, number, number];
}) {
    return (
        <mesh position={position} receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#606D70" roughness={0.95} />
        </mesh>
    );
}

export default function Roads() {
    return (
        <group>
            {/* Main roads */}
            <Road position={[0, 0.025, 0]} size={[14, 0.05, 2.2]} />
            <Road position={[0, 0.03, 0]} size={[2.2, 0.06, 14]} />

            {/* Horizontal lane markings */}
            {[-5, -4, -3, 3, 4, 5].map((x) => (
                <mesh key={`h-${x}`} position={[x, 0.065, 0]}>
                    <boxGeometry args={[0.45, 0.008, 0.045]} />
                    <meshBasicMaterial color="#FFFDF4" />
                </mesh>
            ))}

            {/* Vertical lane markings */}
            {[-5, -4, -3, 3, 4, 5].map((z) => (
                <mesh key={`v-${z}`} position={[0, 0.069, z]}>
                    <boxGeometry args={[0.045, 0.008, 0.45]} />
                    <meshBasicMaterial color="#FFFDF4" />
                </mesh>
            ))}

            {/* Pedestrian crossing on horizontal road */}
            {Array.from({ length: 6 }, (_, i) => (
                <mesh
                    key={`cross-h-${i}`}
                    position={[1.65, 0.065, -0.85 + i * 0.34]}
                >
                    <boxGeometry args={[0.12, 0.008, 0.21]} />
                    <meshBasicMaterial color="#F7F6F2" />
                </mesh>
            ))}

            {/* Pedestrian crossing on vertical road */}
            {Array.from({ length: 6 }, (_, i) => (
                <mesh
                    key={`cross-v-${i}`}
                    position={[-0.85 + i * 0.34, 0.069, 1.65]}
                >
                    <boxGeometry args={[0.21, 0.008, 0.12]} />
                    <meshBasicMaterial color="#F7F6F2" />
                </mesh>
            ))}

            {/* Pavement edging beside vertical road */}
            {[-1.15, 1.15].flatMap((x) =>
                [-4.1, 4.1].map((z) => (
                    <mesh key={`curb-v-${x}-${z}`} position={[x, 0.065, z]}>
                        <boxGeometry args={[0.08, 0.08, 5.8]} />
                        <meshStandardMaterial color="#DBDDD6" />
                    </mesh>
                ))
            )}

            {/* Curbs beside horizontal road — excluding intersection */}
            {[-1.15, 1.15].flatMap((z) =>
                [-4.1, 4.1].map((x) => (
                    <mesh key={`curb-h-${x}-${z}`} position={[x, 0.065, z]}>
                        <boxGeometry args={[5.8, 0.08, 0.08]} />
                        <meshStandardMaterial color="#DBDDD6" />
                    </mesh>
                ))
            )}
        </group>
    );
}