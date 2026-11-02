
import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { DISTRICTS, PALETTE } from "./cityLayout";

type BuildingKind = "glass" | "office" | "apartments";

type BuildingSpec = {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    kind: BuildingKind;
    body: string;
    glass: string;
};

const BUILDINGS: BuildingSpec[] = [
    { x: -3.75, z: -11.25, width: 2.7, depth: 3.05, height: 8.7, kind: "glass", body: "#45A7B3", glass: "#C7F0EE" },
    { x: 3.75, z: -11.25, width: 2.9, depth: 3.2, height: 10.1, kind: "glass", body: "#66BDCA", glass: "#D4F4F2" },
    { x: -3.75, z: -3.75, width: 3.4, depth: 3.25, height: 6.4, kind: "office", body: "#FFCF73", glass: "#79B7C6" },
    { x: 3.75, z: -3.75, width: 3.45, depth: 3.15, height: 5.5, kind: "apartments", body: "#FFAC94", glass: "#9FD2DA" },
    { x: -11.25, z: 3.75, width: 2.8, depth: 3.15, height: 4.9, kind: "apartments", body: "#B0CDB2", glass: "#78AFBE" },
    { x: 3.75, z: 3.75, width: 3.05, depth: 3.1, height: 4.6, kind: "office", body: "#E4C4EA", glass: "#93C7D4" },
];

function BevelBox({
    at,
    size,
    color,
    radius = 0.08,
}: {
    at: [number, number, number];
    size: [number, number, number];
    color: string;
    radius?: number;
}) {
    return (
        <RoundedBox
            position={at}
            args={size}
            radius={radius}
            smoothness={3}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial color={color} roughness={0.72} />
        </RoundedBox>
    );
}

function WindowInstances({
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

    const windows = useMemo(() => {
        const transforms: {
            position: THREE.Vector3;
            scale: THREE.Vector3;
        }[] = [];

        const rows = Math.max(2, Math.floor((height - 0.6) / 0.82));
        const colsX = Math.max(2, Math.floor(width / 0.55));
        const colsZ = Math.max(2, Math.floor(depth / 0.55));

        for (let row = 0; row < rows; row++) {
            const y = 0.7 + row * ((height - 0.95) / rows);

            for (let col = 0; col < colsX; col++) {
                const x = -width / 2 + ((col + 0.5) * width) / colsX;

                for (const sign of [-1, 1]) {
                    transforms.push({
                        position: new THREE.Vector3(
                            x,
                            y,
                            sign * (depth / 2 + 0.018)
                        ),
                        scale: new THREE.Vector3(
                            width / colsX - 0.16,
                            0.43,
                            0.035
                        ),
                    });
                }
            }

            for (let col = 0; col < colsZ; col++) {
                const z = -depth / 2 + ((col + 0.5) * depth) / colsZ;

                for (const sign of [-1, 1]) {
                    transforms.push({
                        position: new THREE.Vector3(
                            sign * (width / 2 + 0.018),
                            y,
                            z
                        ),
                        scale: new THREE.Vector3(
                            0.035,
                            0.43,
                            depth / colsZ - 0.16
                        ),
                    });
                }
            }
        }

        return transforms;
    }, [width, depth, height]);

    useLayoutEffect(() => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();

        windows.forEach(({ position, scale }, index) => {
            matrix.compose(position, quaternion, scale);
            mesh.setMatrixAt(index, matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [windows]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, windows.length]}
            frustumCulled={false}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={color}
                metalness={0.22}
                roughness={0.22}
            />
        </instancedMesh>
    );
}

function Tower({ data }: { data: BuildingSpec }) {
    const { x, z, width, depth, height, kind, body, glass } = data;

    return (
        <group position={[x, 0.18, z]}>
            <BevelBox
                at={[0, height / 2, 0]}
                size={[width, height, depth]}
                color={body}
                radius={kind === "glass" ? 0.18 : 0.07}
            />

            {/* Structural window detailing */}
            <WindowInstances
                width={width}
                depth={depth}
                height={height}
                color={glass}
            />

            <BevelBox
                at={[0, height + 0.12, 0]}
                size={[width + 0.23, 0.22, depth + 0.23]}
                color="#FFF9EE"
            />

            {/* Setback crown on taller towers */}
            {height > 8 && (
                <BevelBox
                    at={[0, height + 0.5, 0]}
                    size={[width * 0.65, 0.62, depth * 0.68]}
                    color="#E8F4EE"
                />
            )}

            {/* Entrance */}
            <BevelBox
                at={[0, 0.49, depth / 2 + 0.07]}
                size={[0.78, 0.95, 0.14]}
                color="#244B62"
            />
            <BevelBox
                at={[0, 1.02, depth / 2 + 0.29]}
                size={[1.35, 0.12, 0.56]}
                color="#FFF7E6"
            />

            {/* Roof equipment */}
            <BevelBox
                at={[-width * 0.2, height + 0.34, -depth * 0.15]}
                size={[0.54, 0.28, 0.6]}
                color="#9CAEB5"
            />
            <BevelBox
                at={[width * 0.23, height + 0.28, depth * 0.12]}
                size={[0.44, 0.16, 0.5]}
                color="#C6D3D3"
            />

            {height > 8 && (
                <mesh position={[0, height + 1.02, 0]}>
                    <cylinderGeometry args={[0.035, 0.045, 1.4, 8]} />
                    <meshStandardMaterial color="#394E58" />
                </mesh>
            )}

            {kind === "apartments" && (
                <>
                    {[1.8, 3.25].map((y) => (
                        <group key={y}>
                            <BevelBox
                                at={[0, y, depth / 2 + 0.36]}
                                size={[width * 0.65, 0.13, 0.73]}
                                color="#FFF4DC"
                            />
                            <BevelBox
                                at={[0, y + 0.3, depth / 2 + 0.7]}
                                size={[width * 0.65, 0.065, 0.07]}
                                color="#455F65"
                            />
                        </group>
                    ))}
                </>
            )}
        </group>
    );
}

function House({
    x,
    z,
    color,
    roof,
    scale = 1,
}: {
    x: number;
    z: number;
    color: string;
    roof: string;
    scale?: number;
}) {
    return (
        <group position={[x, 0.18, z]} scale={scale}>
            <BevelBox
                at={[0, 0.85, 0]}
                size={[1.8, 1.7, 1.65]}
                color={color}
            />

            {/* Two sloped roof planes */}
            {[-1, 1].map((direction) => (
                <mesh
                    key={direction}
                    position={[direction * 0.46, 1.98, 0]}
                    rotation={[0, 0, direction * 0.52]}
                    castShadow
                >
                    <boxGeometry args={[1.1, 0.14, 1.92]} />
                    <meshStandardMaterial color={roof} roughness={0.88} />
                </mesh>
            ))}

            <BevelBox
                at={[0, 0.48, 0.86]}
                size={[0.44, 0.92, 0.09]}
                color="#466C7A"
            />

            {[-0.58, 0.58].map((v) => (
                <group key={v}>
                    <BevelBox
                        at={[v, 1.06, 0.86]}
                        size={[0.29, 0.38, 0.06]}
                        color="#8FD4E3"
                    />
                    <BevelBox
                        at={[v, 1.06, -0.86]}
                        size={[0.29, 0.38, 0.06]}
                        color="#8FD4E3"
                    />
                    <BevelBox
                        at={[0.91, 1.06, v * 0.8]}
                        size={[0.06, 0.38, 0.29]}
                        color="#8FD4E3"
                    />
                    <BevelBox
                        at={[-0.91, 1.06, v * 0.8]}
                        size={[0.06, 0.38, 0.29]}
                        color="#8FD4E3"
                    />
                </group>
            ))}

            {/* Water tank */}
            <mesh position={[0.55, 2.42, -0.35]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.34, 12]} />
                <meshStandardMaterial color="#6E7F85" />
            </mesh>
        </group>
    );
}

function Storefront({
    x,
    z,
    color,
    awning,
    label,
}: {
    x: number;
    z: number;
    color: string;
    awning: string;
    label: string;
}) {
    return (
        <group position={[x, 0.18, z]}>
            <BevelBox
                at={[0, 0.99, 0]}
                size={[2.45, 1.98, 2.15]}
                color={color}
            />
            <BevelBox
                at={[0, 2.06, 0]}
                size={[2.65, 0.17, 2.3]}
                color="#FFF7EA"
            />

            <BevelBox
                at={[0, 1.43, 1.1]}
                size={[2.5, 0.18, 0.67]}
                color={awning}
            />

            <BevelBox
                at={[0, 0.66, 1.09]}
                size={[1.6, 1.14, 0.06]}
                color="#A4DCE2"
            />

            <Text
                position={[0, 1.75, 1.128]}
                fontSize={0.21}
                color={PALETTE.ink}
                anchorX="center"
                anchorY="middle"
                maxWidth={2.1}
            >
                {label}
            </Text>

            {/* Side and rear windows */}
            {[-1, 1].map((side) => (
                <group key={side}>
                    <BevelBox
                        at={[side * 1.25, 1.1, 0]}
                        size={[0.06, 0.6, 0.9]}
                        color="#8FCED6"
                    />
                    <BevelBox
                        at={[0, 1.1, -1.1]}
                        size={[1.25, 0.6, 0.06]}
                        color="#8FCED6"
                    />
                </group>
            ))}
        </group>
    );
}

export default function Architecture() {
    return (
        <group>
            {BUILDINGS.map((building) => (
                <Tower key={`${building.x}-${building.z}`} data={building} />
            ))}

            {/* Residential plots */}
            <group>
                <House x={-12.25} z={10.45} color="#FFD4AE" roof="#E97455" />
                <House x={-10.3} z={12.15} color="#CFE8CB" roof="#5F9A7F" scale={0.94} />

                <House x={-12.2} z={3.2} color="#FFE0B8" roof="#D78667" scale={0.92} />

                <House x={10.3} z={3.0} color="#F6D2C5" roof="#D96A56" scale={0.92} />
                <House x={12.3} z={4.5} color="#DEF0C8" roof="#8CB380" scale={0.92} />

                <House x={3.0} z={10.3} color="#F8D9AA" roof="#B9745B" scale={0.94} />
                <House x={4.65} z={12.3} color="#D4E9E2" roof="#4A8992" scale={0.88} />
            </group>

            {/* Smaller commercial blocks */}
            <Storefront
                x={DISTRICTS.shops[0]}
                z={DISTRICTS.shops[1]}
                color="#FFE5BA"
                awning="#FF5A4E"
                label="FRESH MART"
            />

            <Storefront
                x={DISTRICTS.market[0]}
                z={DISTRICTS.market[1]}
                color="#F8D5A5"
                awning="#3DBE7A"
                label="CITY MARKET"
            />
        </group>
    );
}
