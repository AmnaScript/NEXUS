
import { RoundedBox, Text } from "@react-three/drei";
import { DISTRICTS, PALETTE } from "./cityLayout";

type V3 = [number, number, number];

function Block({
    at,
    size,
    color,
}: {
    at: V3;
    size: V3;
    color: string;
}) {
    return (
        <RoundedBox
            position={at}
            args={size}
            radius={0.055}
            smoothness={2}
            castShadow
            receiveShadow
        >
            <meshStandardMaterial color={color} roughness={0.73} />
        </RoundedBox>
    );
}

function Sign({
    text,
    at,
    color = PALETTE.ink,
    size = 0.24,
}: {
    text: string;
    at: V3;
    color?: string;
    size?: number;
}) {
    return (
        <Text
            position={at}
            fontSize={size}
            color={color}
            anchorX="center"
            anchorY="middle"
            maxWidth={3.8}
        >
            {text}
        </Text>
    );
}


function HospitalModel() {
    const [x, z] = DISTRICTS.hospital;

    return (
        <group position={[x, 0.18, z]}>
            <Block at={[0, 2.1, 0]} size={[4.05, 4.2, 3.75]} color="#FFFDF7" />
            <Block at={[0, 4.29, 0]} size={[4.2, 0.17, 3.9]} color="#E9F0ED" />

            {/* Bands of glass, on all four sides */}
            {[1.05, 1.93, 2.81, 3.69].map((y) => (
                <group key={y}>
                    {[-1.3, -0.45, 0.45, 1.3].map((v) => (
                        <group key={v}>
                            <Block at={[v, y, 1.91]} size={[0.59, 0.49, 0.055]} color="#8FD4DC" />
                            <Block at={[v, y, -1.91]} size={[0.59, 0.49, 0.055]} color="#8FD4DC" />
                            <Block at={[2.055, y, v]} size={[0.055, 0.49, 0.59]} color="#8FD4DC" />
                            <Block at={[-2.055, y, v]} size={[0.055, 0.49, 0.59]} color="#8FD4DC" />
                        </group>
                    ))}
                </group>
            ))}

            {/* Red cross */}
            <Block at={[0, 3.2, 1.97]} size={[0.18, 0.95, 0.07]} color="#FF5A4E" />
            <Block at={[0, 3.2, 2]} size={[0.82, 0.19, 0.08]} color="#FF5A4E" />

            {/* Entrance and emergency canopy */}
            <Block at={[0, 0.55, 1.95]} size={[1.2, 1.1, 0.12]} color="#398999" />
            <Block at={[0, 1.24, 2.28]} size={[2.2, 0.12, 0.9]} color="#FF8F7A" />

            <Sign text="HOSPITAL" at={[0, 3.9, 1.99]} size={0.23} />

            {/* Rooftop helipad */}
            <mesh position={[0, 4.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.25, 40]} />
                <meshStandardMaterial color="#319A8A" />
            </mesh>
            <Text
                position={[0, 4.43, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={1.45}
                color="white"
            >
                H
            </Text>
        </group>
    );
}

function ServiceStation({
    x,
    z,
    title,
    color,
    door,
    bays = 2,
}: {
    x: number;
    z: number;
    title: string;
    color: string;
    door: string;
    bays?: number;
}) {
    return (
        <group position={[x, 0.18, z]}>
            <Block at={[0, 1.3, 0]} size={[4.15, 2.6, 3.8]} color={color} />
            <Block at={[0, 2.68, 0]} size={[4.3, 0.17, 3.95]} color="#FFFCF4" />

            {Array.from({ length: bays }, (_, i) => {
                const spacing = 3.2 / bays;
                const offset = (i - (bays - 1) / 2) * spacing;

                return (
                    <group key={i}>
                        <Block
                            at={[offset, 0.99, 1.95]}
                            size={[spacing - 0.18, 1.65, 0.12]}
                            color={door}
                        />
                        {[0.5, 0.9, 1.3].map((y) => (
                            <Block
                                key={y}
                                at={[offset, y, 2.018]}
                                size={[spacing - 0.32, 0.05, 0.025]}
                                color="#FFF6E5"
                            />
                        ))}
                    </group>
                );
            })}

            <Sign text={title} at={[0, 2.27, 1.98]} size={0.27} />

            {/* Antenna */}
            <mesh position={[1.3, 3.14, -0.9]}>
                <cylinderGeometry args={[0.025, 0.04, 0.85, 8]} />
                <meshStandardMaterial color="#4D5B6D" />
            </mesh>

            {/* Small front sign pole */}
            <mesh position={[-1.65, 0.55, 2.05]}>
                <cylinderGeometry args={[0.035, 0.045, 1.1, 8]} />
                <meshStandardMaterial color="#48546B" />
            </mesh>
        </group>
    );
}

function Cafe() {
    const [x, z] = DISTRICTS.cafe;

    return (
        <group position={[x, 0.18, z]}>
            <Block at={[0, 1.04, -0.58]} size={[3.7, 2.08, 2.75]} color="#FFDEAC" />
            <Block at={[0, 2.15, -0.58]} size={[3.92, 0.17, 2.94]} color="#F7A45C" />

            {/* Front windows and door */}
            <Block at={[-0.83, 0.73, 0.83]} size={[1.03, 1.2, 0.08]} color="#83C8D1" />
            <Block at={[0.83, 0.73, 0.83]} size={[1.03, 1.2, 0.08]} color="#83C8D1" />
            <Block at={[0, 0.55, 0.88]} size={[0.57, 1.1, 0.09]} color="#66505B" />

            {/* Canopy with stripes */}
            <Block at={[0, 1.68, 1.15]} size={[3.82, 0.16, 0.8]} color="#FF5A4E" />
            {[-1.35, -0.45, 0.45, 1.35].map((v) => (
                <Block
                    key={v}
                    at={[v, 1.78, 1.15]}
                    size={[0.36, 0.02, 0.8]}
                    color="#FFF4E0"
                />
            ))}

            <Sign text="SUNNY SIDE CAFÉ" at={[0, 1.98, 0.9]} size={0.23} />

            {/* Outdoor tables */}
            {[-1, 1].map((v) => (
                <group key={v} position={[v * 1.0, 0, 1.65]}>
                    <mesh position={[0, 0.43, 0]}>
                        <cylinderGeometry args={[0.36, 0.36, 0.07, 14]} />
                        <meshStandardMaterial color="#FFFCF4" />
                    </mesh>
                    <mesh position={[0, 0.27, 0]}>
                        <cylinderGeometry args={[0.035, 0.045, 0.38, 8]} />
                        <meshStandardMaterial color="#555C65" />
                    </mesh>
                    <mesh position={[0, 1.15, 0]}>
                        <coneGeometry args={[0.6, 0.32, 12]} />
                        <meshStandardMaterial color={v === -1 ? "#FF5A4E" : "#FFC93C"} />
                    </mesh>
                    <mesh position={[0, 0.77, 0]}>
                        <cylinderGeometry args={[0.035, 0.035, 0.6, 8]} />
                        <meshStandardMaterial color="#555C65" />
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
            <Block at={[0, 0.06, 0]} size={[4.5, 0.1, 4.5]} color="#8CCB84" />

            {/* Walking paths */}
            <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.45, 1.74, 50]} />
                <meshStandardMaterial color="#FDE8B9" side={2} />
            </mesh>

            {/* Pond */}
            <mesh position={[-0.45, 0.135, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.95, 36]} />
                <meshStandardMaterial color={PALETTE.water} roughness={0.22} />
            </mesh>

            <mesh position={[-0.45, 0.15, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.94, 1.05, 36]} />
                <meshStandardMaterial color="#F2EBD5" side={2} />
            </mesh>

            {/* Playground slide */}
            <Block at={[1.25, 0.55, 0.95]} size={[0.62, 0.12, 0.7]} color="#FFC93C" />
            <mesh position={[1.25, 0.43, 1.33]} rotation={[0.55, 0, 0]}>
                <boxGeometry args={[0.5, 0.06, 0.9]} />
                <meshStandardMaterial color="#FF5A4E" />
            </mesh>
            {[-0.23, 0.23].map((v) => (
                <Block key={v} at={[1.25 + v, 0.33, 0.75]} size={[0.06, 0.6, 0.06]} color="#54756A" />
            ))}

            {/* Bench */}
            <Block at={[-1.3, 0.43, 1.15]} size={[0.8, 0.1, 0.25]} color="#B17E56" />
            <Block at={[-1.3, 0.7, 1.33]} size={[0.8, 0.48, 0.08]} color="#B17E56" />
            {[-0.3, 0.3].map((v) => (
                <Block key={v} at={[-1.3 + v, 0.24, 1.15]} size={[0.07, 0.34, 0.07]} color="#475961" />
            ))}
        </group>
    );
}

export default function Landmarks() {
    return (
        <group>
            <HospitalModel />

            <ServiceStation
                x={DISTRICTS.fireStation[0]}
                z={DISTRICTS.fireStation[1]}
                title="FIRE STATION"
                color="#F5B4A0"
                door="#E65F54"
                bays={3}
            />

            <ServiceStation
                x={DISTRICTS.police[0]}
                z={DISTRICTS.police[1]}
                title="POLICE"
                color="#D5E4F2"
                door="#568AA7"
                bays={2}
            />

            <Cafe />
            <Park />
        </group>
    );
}
