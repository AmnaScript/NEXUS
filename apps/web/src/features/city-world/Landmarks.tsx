
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { DISTRICTS } from "./cityLayout";

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
            radius={0.045}
            smoothness={2}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial color={color} roughness={0.72} />
        </RoundedBox>
    );
}

function Sign({
    label,
    at,
    size = 0.23,
}: {
    label: string;
    at: Vec3;
    size?: number;
}) {
    return (
        <Text
            position={at}
            fontSize={size}
            maxWidth={3.5}
            color="#1B1F3B"
            anchorX="center"
            anchorY="middle"
        >
            {label}
        </Text>
    );
}

function Hospital() {
    const [x, z] = DISTRICTS.hospital;

    return (
        <group position={[x, 0.18, z]}>
            {/* Model width 3.2, below the 3.72 plot width */}
            <Box
                at={[0, 2.08, 0]}
                size={[3.18, 4.16, 3.05]}
                color="#FFFCF7"
            />

            <Box
                at={[0, 4.22, 0]}
                size={[3.32, 0.15, 3.19]}
                color="#E4F1EC"
            />

            {Array.from({ length: 4 }, (_, row) => {
                const y = 0.94 + row * 0.86;

                return [-1.02, -0.34, 0.34, 1.02].map(
                    (offset) => (
                        <group key={`${row}-${offset}`}>
                            <Box
                                at={[offset, y, 1.56]}
                                size={[0.43, 0.46, 0.055]}
                                color="#94D5DE"
                            />
                            <Box
                                at={[offset, y, -1.56]}
                                size={[0.43, 0.46, 0.055]}
                                color="#94D5DE"
                            />
                            <Box
                                at={[1.62, y, offset]}
                                size={[0.055, 0.46, 0.43]}
                                color="#94D5DE"
                            />
                            <Box
                                at={[-1.62, y, offset]}
                                size={[0.055, 0.46, 0.43]}
                                color="#94D5DE"
                            />
                        </group>
                    )
                );
            })}

            <Box
                at={[0, 0.5, 1.58]}
                size={[0.86, 0.96, 0.09]}
                color="#398C9B"
            />

            <Box
                at={[0, 1.13, 1.66]}
                size={[1.6, 0.11, 0.3]}
                color="#FF8F7A"
            />

            <Box
                at={[0, 3.14, 1.59]}
                size={[0.16, 0.78, 0.055]}
                color="#FF5A4E"
            />

            <Box
                at={[0, 3.14, 1.61]}
                size={[0.72, 0.17, 0.06]}
                color="#FF5A4E"
            />

            <Sign
                label="HOSPITAL"
                at={[0, 3.83, 1.61]}
                size={0.2}
            />

            {/* Helipad remains on the roof */}
            <mesh
                position={[0, 4.31, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[1.04, 40]} />
                <meshStandardMaterial color="#309A8C" />
            </mesh>

            <Text
                position={[0, 4.33, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.25}
                color="white"
            >
                H
            </Text>
        </group>
    );
}

function ServiceStation({
    position,
    label,
    buildingColor,
    garageColor,
    bays,
}: {
    position: readonly [number, number];
    label: string;
    buildingColor: string;
    garageColor: string;
    bays: number;
}) {
    const [x, z] = position;
    const width = 3.24;
    const garageWidth = 2.72 / bays;

    return (
        <group position={[x, 0.18, z]}>
            <Box
                at={[0, 1.15, 0]}
                size={[width, 2.3, 3.12]}
                color={buildingColor}
            />

            <Box
                at={[0, 2.38, 0]}
                size={[3.37, 0.15, 3.26]}
                color="#FFFDF2"
            />

            {Array.from({ length: bays }, (_, index) => {
                const offset =
                    (index - (bays - 1) / 2) * garageWidth;

                return (
                    <group key={index}>
                        <Box
                            at={[offset, 0.87, 1.59]}
                            size={[garageWidth - 0.11, 1.45, 0.09]}
                            color={garageColor}
                        />

                        {[0.5, 0.88, 1.26].map((y) => (
                            <Box
                                key={y}
                                at={[offset, y, 1.65]}
                                size={[garageWidth - 0.24, 0.035, 0.015]}
                                color="#F9F5E9"
                            />
                        ))}
                    </group>
                );
            })}

            <Sign label={label} at={[0, 2.07, 1.62]} size={0.23} />

            <mesh position={[1.08, 2.79, -0.67]}>
                <cylinderGeometry args={[0.025, 0.035, 0.76, 8]} />
                <meshStandardMaterial color="#485869" />
            </mesh>
        </group>
    );
}

function Cafe() {
    const [x, z] = DISTRICTS.cafe;

    return (
        <group position={[x, 0.18, z]}>
            <Box
                at={[0, 0.97, -0.48]}
                size={[3.14, 1.94, 2.27]}
                color="#FFDBAC"
            />

            <Box
                at={[0, 2.01, -0.48]}
                size={[3.29, 0.15, 2.43]}
                color="#F3A15D"
            />

            {[-0.79, 0.79].map((offset) => (
                <Box
                    key={offset}
                    at={[offset, 0.72, 0.7]}
                    size={[0.77, 1.02, 0.06]}
                    color="#91D1D8"
                />
            ))}

            <Box
                at={[0, 0.53, 0.74]}
                size={[0.47, 1.05, 0.07]}
                color="#574C58"
            />

            <Box
                at={[0, 1.55, 0.97]}
                size={[3.18, 0.12, 0.54]}
                color="#FF5A4E"
            />

            <Sign
                label="SUNNY SIDE CAFÉ"
                at={[0, 1.87, 0.75]}
                size={0.2}
            />

            {/* Outdoor seating stays within the plot */}
            {[-0.92, 0.92].map((offset) => (
                <group key={offset} position={[offset, 0, 1.42]}>
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[0.26, 0.26, 0.065, 12]} />
                        <meshStandardMaterial color="#FFF8E9" />
                    </mesh>
                    <mesh position={[0, 0.23, 0]}>
                        <cylinderGeometry args={[0.025, 0.035, 0.37, 8]} />
                        <meshStandardMaterial color="#596571" />
                    </mesh>
                    <mesh position={[0, 1.05, 0]}>
                        <coneGeometry args={[0.45, 0.25, 12]} />
                        <meshStandardMaterial
                            color={offset < 0 ? "#FFC93C" : "#FF8F7A"}
                        />
                    </mesh>
                    <mesh position={[0, 0.75, 0]}>
                        <cylinderGeometry args={[0.022, 0.022, 0.55, 8]} />
                        <meshStandardMaterial color="#596571" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function Park() {
    const [x, z] = DISTRICTS.park;

    return (
        <group position={[x, 0.18, z]}>
            <Box
                at={[0, 0.045, 0]}
                size={[3.52, 0.09, 3.52]}
                color="#8FCB86"
            />

            <mesh
                position={[-0.42, 0.1, -0.27]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <circleGeometry args={[0.83, 32]} />
                <meshStandardMaterial
                    color="#71CBE5"
                    roughness={0.3}
                />
            </mesh>

            <mesh
                position={[-0.42, 0.105, -0.27]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry args={[0.82, 0.91, 32]} />
                <meshStandardMaterial
                    color="#F3E6C5"
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Playground */}
            <Box
                at={[0.91, 0.42, 0.83]}
                size={[0.53, 0.12, 0.57]}
                color="#FFC93C"
            />

            <mesh
                position={[0.91, 0.35, 1.13]}
                rotation={[0.48, 0, 0]}
            >
                <boxGeometry args={[0.44, 0.06, 0.67]} />
                <meshStandardMaterial color="#FF5A4E" />
            </mesh>

            {/* Benches */}
            <Box
                at={[-1.22, 0.37, 1.12]}
                size={[0.66, 0.1, 0.23]}
                color="#B47B51"
            />
            <Box
                at={[-1.22, 0.61, 1.28]}
                size={[0.66, 0.4, 0.07]}
                color="#B47B51"
            />

            {[
                [1.25, -1.22],
                [-1.25, 1.35],
            ].map(([tx, tz], i) => (
                <group key={i} position={[tx, 0, tz]}>
                    <mesh position={[0, 0.49, 0]}>
                        <cylinderGeometry args={[0.07, 0.09, 0.79, 8]} />
                        <meshStandardMaterial color="#86664D" />
                    </mesh>
                    <mesh position={[0, 1.06, 0]} castShadow>
                        <icosahedronGeometry args={[0.47, 1]} />
                        <meshStandardMaterial
                            color={i === 0 ? "#4EA771" : "#72C57A"}
                            flatShading
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

export default function Landmarks() {
    return (
        <group>
            <Hospital />

            <ServiceStation
                position={DISTRICTS.fireStation}
                label="FIRE STATION"
                buildingColor="#F4B1A2"
                garageColor="#E35C53"
                bays={3}
            />

            <ServiceStation
                position={DISTRICTS.police}
                label="POLICE"
                buildingColor="#D6E4F3"
                garageColor="#5A91AE"
                bays={2}
            />

            <Cafe />
            <Park />
        </group>
    );
}
