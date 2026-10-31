function Streetlight({
    position,
}: {
    position: [number, number, number];
}) {
    return (
        <group position={position}>
            {/* Main pole */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.055, 2, 12]} />
                <meshStandardMaterial color="#526669" roughness={0.6} />
            </mesh>

            {/* Curved-looking horizontal arm */}
            <mesh position={[0.22, 2.04, 0]} castShadow>
                <boxGeometry args={[0.45, 0.055, 0.055]} />
                <meshStandardMaterial color="#526669" />
            </mesh>

            {/* Lamp housing */}
            <mesh position={[0.43, 2, 0]} castShadow>
                <boxGeometry args={[0.32, 0.12, 0.2]} />
                <meshStandardMaterial color="#3A5055" />
            </mesh>

            {/* Light diffuser */}
            <mesh position={[0.43, 1.93, 0]}>
                <boxGeometry args={[0.27, 0.025, 0.16]} />
                <meshStandardMaterial
                    color="#FFF1C5"
                    emissive="#F0DCA0"
                    emissiveIntensity={0.35}
                />
            </mesh>
        </group>
    );
}

export default function StreetDetails() {
    const lights: [number, number, number][] = [
        [-1.45, 0, -4],
        [1.45, 0, -4],
        [-1.45, 0, 4],
        [1.45, 0, 4],
    ];

    return (
        <group>
            {lights.map((position, index) => (
                <Streetlight key={index} position={position} />
            ))}
        </group>
    );
}