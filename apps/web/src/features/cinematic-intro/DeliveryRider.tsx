import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Wheel({ x }: { x: number }) {
    return (
        <group position={[x, 0.24, 0]}>
            {/* Tire */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.24, 0.24, 0.16, 32]} />
                <meshStandardMaterial color="#252B30" roughness={0.9} />
            </mesh>

            {/* Wheel hub */}
            {[-0.085, 0.085].map((z) => (
                <mesh
                    key={z}
                    position={[0, 0, z]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.11, 0.11, 0.015, 24]} />
                    <meshStandardMaterial
                        color="#AEB8B7"
                        metalness={0.5}
                        roughness={0.4}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function DeliveryRider() {
    const riderRef = useRef<THREE.Group>(null);
    const wheelsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!riderRef.current) return;

        const time = state.clock.getElapsedTime();
        const t = Math.min(time / 5, 1);
        const progress = t * t * (3 - 2 * t);

        riderRef.current.position.x = -4.5 + progress * 3;
        riderRef.current.position.y =
            0.025 + Math.sin(time * 12) * 0.004 * (1 - t);

        if (wheelsRef.current) {
            wheelsRef.current.rotation.z = -progress * 12.5;
        }
    });

    return (
        <group ref={riderRef} position={[-4.5, 0.08, 0]}>
            {/* Wheels */}
            <Wheel x={-0.43} />
            <Wheel x={0.48} />

            {/* Main scooter frame */}
            <mesh position={[0, 0.43, 0]} castShadow>
                <boxGeometry args={[1.1, 0.16, 0.32]} />
                <meshStandardMaterial color="#E96F49" roughness={0.5} />
            </mesh>

            {/* Front fairing */}
            <mesh position={[0.38, 0.66, 0]} castShadow>
                <boxGeometry args={[0.22, 0.65, 0.39]} />
                <meshStandardMaterial color="#EA7954" roughness={0.5} />
            </mesh>

            {/* Seat */}
            <mesh position={[-0.13, 0.68, 0]} castShadow>
                <boxGeometry args={[0.48, 0.1, 0.36]} />
                <meshStandardMaterial color="#303940" />
            </mesh>

            {/* Steering column */}
            <mesh position={[0.43, 1.03, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.3, 12]} />
                <meshStandardMaterial color="#3B474B" />
            </mesh>

            {/* Handlebar */}
            <mesh position={[0.43, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.55, 12]} />
                <meshStandardMaterial color="#303940" />
            </mesh>

            {/* Headlight */}
            <mesh position={[0.5, 0.74, 0]}>
                <sphereGeometry args={[0.11, 20, 20]} />
                <meshStandardMaterial
                    color="#FFF5DC"
                    emissive="#F4D38C"
                    emissiveIntensity={0.35}
                />
            </mesh>

            {/* Rider torso */}
            <mesh
                position={[-0.15, 1.08, 0]}
                rotation={[0, 0, -0.18]}
                castShadow
            >
                <capsuleGeometry args={[0.19, 0.33, 6, 12]} />
                <meshStandardMaterial color="#F4EEE5" />
            </mesh>

            {/* Rider head */}
            <mesh position={[-0.0, 1.52, 0]} castShadow>
                <sphereGeometry args={[0.19, 24, 24]} />
                <meshStandardMaterial color="#F0C4A4" />
            </mesh>

            {/* Helmet */}
            <mesh position={[-0.08, 1.63, 0]} castShadow>
                <sphereGeometry
                    args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]}
                />
                <meshStandardMaterial color="#26343B" />
            </mesh>

            {/* Rider arms */}
            {[-0.19, 0.19].map((z) => (
                <mesh
                    key={z}
                    position={[0.18, 1.04, z]}
                    rotation={[0, 0, -1.1]}
                    castShadow
                >
                    <capsuleGeometry args={[0.065, 0.4, 4, 10]} />
                    <meshStandardMaterial color="#F4EEE5" />
                </mesh>
            ))}

            {/* Delivery parcel box */}
            <mesh position={[-0.62, 0.91, 0]} castShadow>
                <boxGeometry args={[0.42, 0.42, 0.47]} />
                <meshStandardMaterial color="#DA6543" />
            </mesh>

            {/* Parcel stripe */}
            <mesh position={[-0.62, 0.91, 0]}>
                <boxGeometry args={[0.09, 0.42, 0.008]} />
                <meshStandardMaterial color="#FFD7B9" />
            </mesh>
        </group>
    );
}