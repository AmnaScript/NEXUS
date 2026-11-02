
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CITY, DISTRICTS } from "./cityLayout";

type TreePoint = {
    x: number;
    z: number;
    scale: number;
};

function generateTrees(): TreePoint[] {
    const result: TreePoint[] = [];

    // Trees along the outer streets; deterministic variation.
    for (let i = 0; i < 14; i++) {
        const p = -13.8 + i * 2.08;
        const scale = 0.72 + ((i * 7) % 5) * 0.085;

        result.push({ x: p, z: -14.35, scale });
        result.push({ x: p, z: 14.35, scale: scale * 0.9 });
        result.push({ x: -14.35, z: p, scale: scale * 1.05 });
        result.push({ x: 14.35, z: p, scale });
    }

    // Extra greenery in the central park.
    const [px, pz] = DISTRICTS.park;
    [
        [-1.8, -1.7],
        [1.7, -1.65],
        [-1.8, 1.65],
        [1.65, 1.65],
        [0.65, -1.85],
        [-1.85, 0.15],
    ].forEach(([x, z], index) => {
        result.push({
            x: px + x,
            z: pz + z,
            scale: 0.62 + (index % 3) * 0.12,
        });
    });

    return result;
}

function InstancedTrees() {
    const trunksRef = useRef<THREE.InstancedMesh>(null);
    const crownsRef = useRef<THREE.InstancedMesh>(null);
    const trees = useMemo(generateTrees, []);

    useLayoutEffect(() => {
        const trunkMesh = trunksRef.current;
        const crownMesh = crownsRef.current;
        if (!trunkMesh || !crownMesh) return;

        const dummy = new THREE.Object3D();
        const colors = ["#4CA86D", "#6DBF78", "#8FD58A", "#36936E"];

        trees.forEach((tree, i) => {
            dummy.position.set(tree.x, tree.scale * 0.44, tree.z);
            dummy.scale.set(tree.scale, tree.scale, tree.scale);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            trunkMesh.setMatrixAt(i, dummy.matrix);

            dummy.position.set(tree.x, tree.scale * 1.28, tree.z);
            dummy.scale.setScalar(tree.scale * 0.72);
            dummy.rotation.set(0, (i % 7) * 0.42, 0);
            dummy.updateMatrix();
            crownMesh.setMatrixAt(i, dummy.matrix);
            crownMesh.setColorAt(i, new THREE.Color(colors[i % colors.length]));
        });

        trunkMesh.instanceMatrix.needsUpdate = true;
        crownMesh.instanceMatrix.needsUpdate = true;
        if (crownMesh.instanceColor) {
            crownMesh.instanceColor.needsUpdate = true;
        }
        trunkMesh.computeBoundingSphere();
        crownMesh.computeBoundingSphere();
    }, [trees]);

    return (
        <>
            <instancedMesh
                ref={trunksRef}
                args={[undefined, undefined, trees.length]}
                receiveShadow
            >
                <cylinderGeometry args={[0.07, 0.11, 0.88, 7]} />
                <meshStandardMaterial color="#80664F" />
            </instancedMesh>

            <instancedMesh
                ref={crownsRef}
                args={[undefined, undefined, trees.length]}
                castShadow
            >
                <icosahedronGeometry args={[0.75, 1]} />
                <meshStandardMaterial
                    color="#FFFFFF"
                    roughness={0.93}
                    flatShading
                />
            </instancedMesh>
        </>
    );
}

function PineTree({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 0.52, 0]}>
                <cylinderGeometry args={[0.09, 0.12, 1.04, 8]} />
                <meshStandardMaterial color="#81654E" />
            </mesh>

            {[0.72, 1.12, 1.48].map((y, i) => (
                <mesh key={i} position={[0, y, 0]} castShadow>
                    <coneGeometry args={[0.7 - i * 0.16, 0.85, 8]} />
                    <meshStandardMaterial color={["#2E865F", "#3C9B69", "#65B679"][i]} />
                </mesh>
            ))}
        </group>
    );
}

function Bush({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0.23, z]}>
            {[-0.16, 0, 0.16].map((v, i) => (
                <mesh key={v} position={[v, 0.06 + i * 0.03, 0]} castShadow>
                    <sphereGeometry args={[0.23, 9, 7]} />
                    <meshStandardMaterial color={["#409C67", "#65B974", "#8BD384"][i]} />
                </mesh>
            ))}
        </group>
    );
}

function StreetLamp({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0.17, z]}>
            <mesh position={[0, 0.96, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.05, 1.92, 8]} />
                <meshStandardMaterial color="#3E5061" metalness={0.45} />
            </mesh>
            <mesh position={[0.2, 1.95, 0]}>
                <boxGeometry args={[0.42, 0.045, 0.05]} />
                <meshStandardMaterial color="#3E5061" />
            </mesh>
            <mesh position={[0.39, 1.89, 0]}>
                <boxGeometry args={[0.27, 0.11, 0.18]} />
                <meshStandardMaterial
                    color="#FFF3BE"
                    emissive="#FFE09D"
                    emissiveIntensity={0.55}
                />
            </mesh>
        </group>
    );
}

function TrafficSignal({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0.17, z]}>
            <mesh position={[0, 0.98, 0]}>
                <cylinderGeometry args={[0.035, 0.045, 1.96, 8]} />
                <meshStandardMaterial color="#384958" />
            </mesh>

            <mesh position={[0, 2.05, 0]}>
                <boxGeometry args={[0.28, 0.68, 0.25]} />
                <meshStandardMaterial color="#263943" />
            </mesh>

            {["#FF5A4E", "#FFC93C", "#3DBE7A"].map((color, i) => (
                <mesh
                    key={color}
                    position={[0, 2.27 - i * 0.2, 0.14]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={i === 0 ? 0.7 : 0.09}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function Environment() {
    const lamps = CITY.roads.flatMap((road, i) =>
        [-12, -4, 4, 12].map((position, j) => ({
            x: road + 1.48,
            z: position,
            key: `${i}-${j}`,
        }))
    );

    return (
        <group>
            <InstancedTrees />

            {/* Trees with a different silhouette */}
            <PineTree x={-13.7} z={10.3} />
            <PineTree x={-9.1} z={13.5} />
            <PineTree x={12.8} z={12.8} />
            <PineTree x={10.0} z={12.85} />

            {/* Park and residential bushes */}
            {[
                [9.4, 9.4],
                [13, 9.7],
                [9.7, 12.2],
                [-12.9, 5.6],
                [-9.3, 5.2],
                [4.8, 9.6],
            ].map(([x, z], i) => (
                <Bush key={i} x={x} z={z} />
            ))}

            {lamps.map((lamp) => (
                <StreetLamp
                    key={lamp.key}
                    x={lamp.x}
                    z={lamp.z}
                />
            ))}

            {/* Intersection signal posts on sidewalk corners */}
            {CITY.roads.flatMap((x) =>
                CITY.roads.map((z) => (
                    <TrafficSignal
                        key={`${x}-${z}`}
                        x={x + 1.45}
                        z={z + 1.45}
                    />
                ))
            )}
        </group>
    );
}
