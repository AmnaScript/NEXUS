
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
    BLOCK_CENTERS,
    CITY,
    DISTRICTS,
} from "./cityLayout";

type TreePoint = {
    x: number;
    z: number;
    scale: number;
};

function getTreePositions(): TreePoint[] {
    const trees: TreePoint[] = [];

    BLOCK_CENTERS.forEach((value, index) => {
        const scale = 0.78 + (index % 3) * 0.09;

        trees.push(
            { x: value, z: -21.75, scale },
            { x: value, z: 21.75, scale },
            { x: -21.75, z: value, scale },
            { x: 21.75, z: value, scale }
        );
    });

    const [px, pz] = DISTRICTS.park;

    [
        [-1.25, -1.25],
        [1.25, -1.25],
        [-1.25, 1.25],
        [1.25, 1.25],
    ].forEach(([dx, dz], index) => {
        trees.push({
            x: px + dx,
            z: pz + dz,
            scale: 0.53 + index * 0.04,
        });
    });

    return trees;
}

function Trees() {
    const trunks = useRef<THREE.InstancedMesh>(null);
    const crowns = useRef<THREE.InstancedMesh>(null);
    const positions = useMemo(getTreePositions, []);

    useLayoutEffect(() => {
        const trunkMesh = trunks.current;
        const crownMesh = crowns.current;

        if (!trunkMesh || !crownMesh) return;

        const dummy = new THREE.Object3D();
        const colors = [
            "#46A96D",
            "#6CBF7B",
            "#86D18D",
            "#368F63",
        ];

        positions.forEach((tree, index) => {
            dummy.position.set(
                tree.x,
                tree.scale * 0.49,
                tree.z
            );
            dummy.scale.setScalar(tree.scale);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();

            trunkMesh.setMatrixAt(index, dummy.matrix);

            dummy.position.set(
                tree.x,
                tree.scale * 1.28,
                tree.z
            );
            dummy.scale.setScalar(tree.scale * 0.7);
            dummy.rotation.set(0, index * 0.29, 0);
            dummy.updateMatrix();

            crownMesh.setMatrixAt(index, dummy.matrix);
            crownMesh.setColorAt(
                index,
                new THREE.Color(colors[index % colors.length])
            );
        });

        trunkMesh.instanceMatrix.needsUpdate = true;
        crownMesh.instanceMatrix.needsUpdate = true;

        if (crownMesh.instanceColor) {
            crownMesh.instanceColor.needsUpdate = true;
        }

        trunkMesh.computeBoundingSphere();
        crownMesh.computeBoundingSphere();
    }, [positions]);

    return (
        <>
            <instancedMesh
                ref={trunks}
                args={[undefined, undefined, positions.length]}
            >
                <cylinderGeometry args={[0.065, 0.1, 0.9, 7]} />
                <meshStandardMaterial color="#80634D" />
            </instancedMesh>

            <instancedMesh
                ref={crowns}
                args={[undefined, undefined, positions.length]}
                castShadow
            >
                <icosahedronGeometry args={[0.75, 1]} />
                <meshStandardMaterial
                    color="white"
                    flatShading
                    roughness={0.9}
                />
            </instancedMesh>
        </>
    );
}

function StreetLamp({
    x,
    z,
}: {
    x: number;
    z: number;
}) {
    return (
        <group position={[x, 0.17, z]}>
            <mesh position={[0, 0.9, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.05, 1.8, 8]} />
                <meshStandardMaterial color="#435467" />
            </mesh>

            <mesh position={[0.16, 1.81, 0]}>
                <boxGeometry args={[0.32, 0.045, 0.05]} />
                <meshStandardMaterial color="#435467" />
            </mesh>

            <mesh position={[0.31, 1.76, 0]}>
                <boxGeometry args={[0.22, 0.09, 0.15]} />
                <meshStandardMaterial
                    color="#FFF2BA"
                    emissive="#FFE09D"
                    emissiveIntensity={0.25}
                />
            </mesh>
        </group>
    );
}

export default function Environment() {
    const safeOffset = CITY.roadWidth / 2 + 0.21;

    const lamps = CITY.roads.flatMap((road, index) =>
        BLOCK_CENTERS.map((block, blockIndex) => ({
            x: road + safeOffset,
            z: block,
            key: `${index}-${blockIndex}`,
        }))
    ).filter(({ x }) => x < CITY.half - 0.15);

    return (
        <group>
            <Trees />

            {lamps.map((lamp) => (
                <StreetLamp
                    key={lamp.key}
                    x={lamp.x}
                    z={lamp.z}
                />
            ))}
        </group>
    );
}
