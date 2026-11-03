
import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { DISTRICTS } from "./cityLayout";

type Vec3 = [number, number, number];

type Building = {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    color: string;
    glass: string;
    style: "tower" | "office" | "apartment";
};

const BUILDINGS: Building[] = [
    {
        x: -3.75, z: -11.25,
        width: 2.8, depth: 2.8, height: 8.5,
        color: "#5CB2BE", glass: "#D2F4ED",
        style: "tower",
    },
    {
        x: 3.75, z: -11.25,
        width: 2.95, depth: 2.95, height: 9.7,
        color: "#79C6D0", glass: "#D9F7F1",
        style: "tower",
    },
    {
        x: -3.75, z: -3.75,
        width: 3.05, depth: 2.9, height: 6.0,
        color: "#F2C77C", glass: "#87C6D2",
        style: "office",
    },
    {
        x: 3.75, z: -3.75,
        width: 3.05, depth: 2.85, height: 5.3,
        color: "#F6AA99", glass: "#B5DCE2",
        style: "apartment",
    },
    {
        x: -11.25, z: 3.75,
        width: 2.95, depth: 2.95, height: 4.6,
        color: "#ADCDB5", glass: "#86BECF",
        style: "apartment",
    },
    {
        x: 3.75, z: 3.75,
        width: 3.0, depth: 2.9, height: 4.4,
        color: "#DCC5EA", glass: "#A9D7DF",
        style: "office",
    },
];

function Box({
    position,
    size,
    color,
}: {
    position: Vec3;
    size: Vec3;
    color: string;
}) {
    return (
        <RoundedBox
            position={position}
            args={size}
            radius={0.055}
            smoothness={2}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial color={color} roughness={0.74} />
        </RoundedBox>
    );
}

function TowerWindows({
    width,
    depth,
    height,
    color,
}: {
    width: number;
    depth: number;
    height: number;
    color: string;
}) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const transforms = useMemo(() => {
        const items: {
            position: THREE.Vector3;
            size: THREE.Vector3;
        }[] = [];

        const rows = Math.max(2, Math.floor(height / 0.8));
        const colsX = Math.max(2, Math.floor(width / 0.56));
        const colsZ = Math.max(2, Math.floor(depth / 0.56));

        for (let row = 0; row < rows; row++) {
            const y = 0.72 + row * ((height - 0.95) / rows);

            for (let col = 0; col < colsX; col++) {
                const x = -width / 2 + ((col + 0.5) * width) / colsX;

                for (const side of [-1, 1]) {
                    items.push({
                        position: new THREE.Vector3(
                            x,
                            y,
                            side * (depth / 2 + 0.028)
                        ),
                        size: new THREE.Vector3(
                            width / colsX - 0.15,
                            0.41,
                            0.045
                        ),
                    });
                }
            }

            for (let col = 0; col < colsZ; col++) {
                const z = -depth / 2 + ((col + 0.5) * depth) / colsZ;

                for (const side of [-1, 1]) {
                    items.push({
                        position: new THREE.Vector3(
                            side * (width / 2 + 0.028),
                            y,
                            z
                        ),
                        size: new THREE.Vector3(
                            0.045,
                            0.41,
                            depth / colsZ - 0.15
                        ),
                    });
                }
            }
        }

        return items;
    }, [width, depth, height]);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const dummy = new THREE.Object3D();

        transforms.forEach((item, index) => {
            dummy.position.copy(item.position);
            dummy.scale.copy(item.size);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();

            mesh.setMatrixAt(index, dummy.matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [transforms]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, transforms.length]}
            frustumCulled={false}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={color}
                metalness={0.17}
                roughness={0.29}
            />
        </instancedMesh>
    );
}

function CityBuilding({ data }: { data: Building }) {
    const {
        x, z, width, depth, height, color, glass, style,
    } = data;

    return (
        <group position={[x, 0.18, z]}>
            <Box
                position={[0, height / 2, 0]}
                size={[width, height, depth]}
                color={color}
            />

            <TowerWindows
                width={width}
                depth={depth}
                height={height}
                color={glass}
            />

            <Box
                position={[0, height + 0.1, 0]}
                size={[width + 0.15, 0.2, depth + 0.15]}
                color="#FFFCF1"
            />

            <Box
                position={[0, 0.5, depth / 2 + 0.05]}
                size={[0.68, 0.98, 0.11]}
                color="#345E73"
            />

            <Box
                position={[0, 1.04, depth / 2 + 0.22]}
                size={[1.25, 0.11, 0.42]}
                color="#FFF6E5"
            />

            {style === "tower" && (
                <>
                    <Box
                        position={[0, height + 0.41, 0]}
                        size={[width * 0.62, 0.44, depth * 0.59]}
                        color="#E6F1E9"
                    />
                    <mesh position={[0, height + 1.02, 0]}>
                        <cylinderGeometry args={[0.03, 0.04, 1.0, 8]} />
                        <meshStandardMaterial color="#465A62" />
                    </mesh>
                </>
            )}

            {style === "apartment" &&
                [1.7, 3.1].map((y) => (
                    <group key={y}>
                        <Box
                            position={[0, y, depth / 2 + 0.26]}
                            size={[width * 0.59, 0.11, 0.48]}
                            color="#FFF3E2"
                        />
                        <Box
                            position={[0, y + 0.24, depth / 2 + 0.47]}
                            size={[width * 0.59, 0.05, 0.06]}
                            color="#526C73"
                        />
                    </group>
                ))}
        </group>
    );
}

function House({
    x,
    z,
    wall,
    roof,
    scale = 1,
}: {
    x: number;
    z: number;
    wall: string;
    roof: string;
    scale?: number;
}) {
    return (
        <group position={[x, 0.18, z]} scale={scale}>
            <Box
                position={[0, 0.7, 0]}
                size={[1.56, 1.4, 1.47]}
                color={wall}
            />

            {[-1, 1].map((side) => (
                <mesh
                    key={side}
                    position={[side * 0.4, 1.65, 0]}
                    rotation={[0, 0, side * 0.54]}
                    castShadow
                >
                    <boxGeometry args={[0.99, 0.13, 1.73]} />
                    <meshStandardMaterial color={roof} />
                </mesh>
            ))}

            <Box
                position={[0, 0.45, 0.78]}
                size={[0.37, 0.9, 0.07]}
                color="#476477"
            />

            {[-0.48, 0.48].map((offset) => (
                <group key={offset}>
                    <Box
                        position={[offset, 0.95, 0.77]}
                        size={[0.28, 0.32, 0.05]}
                        color="#9BD3DC"
                    />
                    <Box
                        position={[offset, 0.95, -0.77]}
                        size={[0.28, 0.32, 0.05]}
                        color="#9BD3DC"
                    />
                </group>
            ))}
        </group>
    );
}

function Homes({
    x,
    z,
    colors,
}: {
    x: number;
    z: number;
    colors: [string, string];
}) {
    return (
        <group>
            <House
                x={x - 0.88}
                z={z - 0.18}
                wall={colors[0]}
                roof="#DC8061"
                scale={0.94}
            />

            <House
                x={x + 0.88}
                z={z + 0.18}
                wall={colors[1]}
                roof="#639C87"
                scale={0.94}
            />
        </group>
    );
}

function Shop({
    x,
    z,
    title,
    awning,
}: {
    x: number;
    z: number;
    title: string;
    awning: string;
}) {
    return (
        <group position={[x, 0.18, z]}>
            <Box
                position={[0, 0.92, 0]}
                size={[2.85, 1.84, 2.55]}
                color="#F8DFB8"
            />

            <Box
                position={[0, 1.91, 0]}
                size={[3.0, 0.15, 2.73]}
                color="#FFF9EF"
            />

            <Box
                position={[0, 0.62, 1.31]}
                size={[1.8, 1.17, 0.07]}
                color="#9CD2DC"
            />

            <Box
                position={[0, 1.36, 1.44]}
                size={[3.02, 0.13, 0.55]}
                color={awning}
            />

            <Text
                position={[0, 1.7, 1.33]}
                fontSize={0.19}
                maxWidth={2.6}
                color="#1B1F3B"
                anchorX="center"
                anchorY="middle"
            >
                {title}
            </Text>
        </group>
    );
}

export default function Architecture() {
    return (
        <group>
            {BUILDINGS.map((building) => (
                <CityBuilding
                    key={`${building.x}-${building.z}`}
                    data={building}
                />
            ))}

            <Homes
                x={DISTRICTS.residentialC[0]}
                z={DISTRICTS.residentialC[1]}
                colors={["#F8D6BD", "#D8E9C8"]}
            />

            <Homes
                x={DISTRICTS.residentialD[0]}
                z={DISTRICTS.residentialD[1]}
                colors={["#FFD3AD", "#CFE7D1"]}
            />

            <Homes
                x={DISTRICTS.houses[0]}
                z={DISTRICTS.houses[1]}
                colors={["#F7D5AE", "#D5EBE4"]}
            />

            <Shop
                x={DISTRICTS.shops[0]}
                z={DISTRICTS.shops[1]}
                title="FRESH MART"
                awning="#FF5A4E"
            />

            <Shop
                x={DISTRICTS.market[0]}
                z={DISTRICTS.market[1]}
                title="CITY MARKET"
                awning="#3DBE7A"
            />
        </group>
    );
}
