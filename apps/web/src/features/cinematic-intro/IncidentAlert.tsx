import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";

export default function IncidentAlert() {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        if (!groupRef.current) return;

        groupRef.current.visible = time >= 5;

        if (time < 5) return;

        const elapsed = time - 5;

        groupRef.current.position.y =
            2.8 + Math.sin(elapsed * 2) * 0.08;

        if (ringRef.current) {
            const pulse = (elapsed % 1.8) / 1.8;

            ringRef.current.scale.setScalar(1 + pulse * 0.65);

            const material = ringRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0.55 * (1 - pulse);
        }
    });

    return (
        <Billboard follow>
            <group
                ref={groupRef}
                position={[-0.5, 2.8, 1.5]}
                visible={false}
            >
                {/* Warning diamond */}
                <mesh rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.43, 0.43, 0.1]} />
                    <meshStandardMaterial
                        color="#EA7954"
                        emissive="#EA7954"
                        emissiveIntensity={0.25}
                    />
                </mesh>

                {/* Exclamation mark */}
                <mesh position={[0, 0.04, 0.065]}>
                    <boxGeometry args={[0.055, 0.18, 0.015]} />
                    <meshBasicMaterial color="#FFFFFF" />
                </mesh>

                <mesh position={[0, -0.1, 0.065]}>
                    <sphereGeometry args={[0.03, 12, 12]} />
                    <meshBasicMaterial color="#FFFFFF" />
                </mesh>

                {/* Pulsing ring */}
                <mesh ref={ringRef} position={[0, 0, -0.04]}>
                    <torusGeometry args={[0.39, 0.015, 8, 32]} />
                    <meshBasicMaterial
                        color="#EA7954"
                        transparent
                        opacity={0.45}
                        depthWrite={false}
                    />
                </mesh>
            </group>
        </Billboard>
    );
}