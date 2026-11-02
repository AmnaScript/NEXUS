import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type IncidentStatus = "New" | "Under Review" | "Resolved";

type SmartCityModelProps = {
    mode?: "hero" | "simulation";
    activeIncidentId?: string | null;
    activeIncidentStatus?: IncidentStatus | null;
    onSelectIncident?: (incidentId: string) => void;
};

const COLORS = {
    ground: "#F2F4F1",
    asphalt: "#6F8187",
    roadEdge: "#85979C",
    divider: "#EAF1EF",
    sidewalk: "#D9DFDB",

    towerBody: "#F8FBFA",
    towerBodyAlt: "#F0F5F4",
    towerGlass: "#8DCFD1",
    towerGlassDark: "#5EAEB2",
    roof: "#D9E7E4",
    trim: "#B9CDCA",

    houseBody: "#F6F2EC",
    houseRoof: "#D98C6B",
    houseRoofDark: "#C06C4C",

    hospitalBody: "#F7FAFA",
    hospitalGlass: "#A9DDE0",
    hospitalHelipad: "#86CBC8",

    treeLeaf: "#77BE9B",
    treeLeafDark: "#4DA78A",
    treeLeafLight: "#A7D9BB",
    trunk: "#8B6B4C",

    lamp: "#38454C",
    lampGlow: "#FDE9AB",

    incidentHigh: "#E57A55",
    incidentMedium: "#D8A34D",
    incidentLow: "#2C9A90",
    resolved: "#3DBB7A",

    water: "#78C7E8",
    cone: "#F48A58",
    barricade: "#D96A43",
    grass: "#D8E7D7",
    fountain: "#BFE6F1",
};

const BUILDINGS = [
    { x: -8.4, z: -5.6, w: 2.2, d: 2.2, height: 6.3, glass: "#8DCFD1", body: "#F7FBFA" },
    { x: -4.9, z: -6.2, w: 2.4, d: 2.2, height: 7.0, glass: "#9BD7D8", body: "#F9FCFB" },
    { x: -1.3, z: -6.0, w: 2.5, d: 2.3, height: 7.7, glass: "#79C9D1", body: "#F4F9F8" },
    { x: 2.5, z: -6.1, w: 2.1, d: 2.2, height: 6.5, glass: "#67BBC2", body: "#F8FBFA" },
    { x: 6.0, z: -5.7, w: 2.6, d: 2.5, height: 7.1, glass: "#9ED9DC", body: "#F6FBFA" },

    { x: -7.0, z: -1.5, w: 2.3, d: 2.3, height: 5.5, glass: "#7BC5CA", body: "#F5FAF9" },
    { x: -2.5, z: -1.5, w: 2.1, d: 2.1, height: 4.7, glass: "#73BEC4", body: "#F7FBFA" },
    { x: 1.6, z: -1.2, w: 2.4, d: 2.3, height: 6.9, glass: "#8DD0D2", body: "#F7FBFA" },
    { x: 5.5, z: -1.2, w: 2.2, d: 2.2, height: 5.9, glass: "#73C4C8", body: "#F2F7F6" },

    { x: -6.3, z: 3.4, w: 2.2, d: 2.2, height: 4.9, glass: "#93D4D5", body: "#F6FBFA" },
    { x: -2.1, z: 3.6, w: 2.3, d: 2.1, height: 5.7, glass: "#68B7C0", body: "#F7FBFA" },
    { x: 2.1, z: 3.5, w: 2.5, d: 2.4, height: 4.8, glass: "#89D0D3", body: "#F9FCFB" },
    { x: 6.1, z: 3.5, w: 2.4, d: 2.3, height: 6.6, glass: "#8DCFD1", body: "#F6FBFA" },
];

const HOUSES = [
    { x: -9.0, z: 0.8, w: 2.2, d: 1.9, h: 1.7 },
    { x: -0.2, z: 0.6, w: 1.8, d: 1.6, h: 1.5 },
    { x: 8.6, z: 1.2, w: 2.0, d: 1.8, h: 1.6 },
    { x: 8.4, z: -2.4, w: 1.8, d: 1.6, h: 1.45 },
];

const TREE_POINTS = [
    [-10.0, -4.8], [-10.2, 2.8], [-8.8, 5.8], [-7.2, -7.4], [-7.2, 1.5],
    [-5.6, 1.3], [-4.6, 5.8], [-3.5, -7.4], [-2.2, 1.2], [-1.0, -8.0],
    [0.4, 5.9], [2.2, -7.6], [3.9, 5.9], [4.8, 1.5], [6.4, -7.4], [7.5, 1.1],
    [8.8, -5.3], [9.2, 4.4], [0.0, 7.2], [1.2, 7.1], [2.2, 7.0], [3.2, 7.1],
    [-1.1, 7.0], [-2.1, 7.0], [-3.1, 7.1],
];

const STREET_LIGHTS = [
    [-8.0, -4.4], [-4.0, -4.4], [0.0, -4.4], [4.0, -4.4], [8.0, -4.4],
    [-8.0, 0.0], [-4.0, 0.0], [0.0, 0.0], [4.0, 0.0], [8.0, 0.0],
    [-8.0, 4.2], [-4.0, 4.2], [0.0, 4.2], [4.0, 4.2], [8.0, 4.2],
];

const TRAFFIC_LIGHTS = [
    [-5.1, -1.7], [5.1, -1.7], [-5.1, 1.7], [5.1, 1.7],
    [-1.4, -5.0], [1.4, -5.0], [-1.4, 5.0], [1.4, 5.0],
];

export default function SmartCityModel({
    mode = "hero",
    activeIncidentId = "NX-1042",
    activeIncidentStatus = "New",
    onSelectIncident,
}: SmartCityModelProps) {
    const incidents = useMemo(
        () => [
            {
                id: "NX-1042",
                type: "road-obstruction" as const,
                position: [0, 0, 2.6] as [number, number, number],
                color: COLORS.incidentHigh,
            },
            {
                id: "NX-1043",
                type: "water-leak" as const,
                position: [-5.2, 0, -0.8] as [number, number, number],
                color: COLORS.incidentMedium,
            },
            {
                id: "NX-1044",
                type: "signal-failure" as const,
                position: [5.2, 0, -0.6] as [number, number, number],
                color: COLORS.incidentLow,
            },
        ],
        []
    );

    return (
        <group position={[0, 0, 0]} scale={mode === "hero" ? 1.05 : 1.2}>
            <LightingHelpers />
            <Ground />
            <RoadNetwork />
            <Park />
            <Hospital />
            <FireStation />
            <ResidentialHouses />
            <OfficeBuildings />
            <CityTrees />
            <StreetLights />
            <TrafficLights />

            <StaticVehicles />

            {incidents.map((incident) => (
                <IncidentVisual
                    key={incident.id}
                    incidentId={incident.id}
                    type={incident.type}
                    position={incident.position}
                    color={incident.color}
                    selected={activeIncidentId === incident.id}
                    status={activeIncidentId === incident.id ? activeIncidentStatus : "New"}
                    onSelectIncident={onSelectIncident}
                />
            ))}
        </group>
    );
}

function LightingHelpers() {
    return (
        <>
            <ambientLight intensity={1.1} />
            <directionalLight
                position={[12, 18, 10]}
                intensity={1.7}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <hemisphereLight
                args={["#ffffff", "#dceae4", 0.55]}
            />
        </>
    );
}

function Ground() {
    return (
        <group>
            <mesh receiveShadow position={[0, -0.08, 0]}>
                <boxGeometry args={[24, 0.16, 18]} />
                <meshStandardMaterial color={COLORS.ground} />
            </mesh>

            <mesh receiveShadow position={[0, 0.005, 0]}>
                <planeGeometry args={[24, 18]} />
                <meshStandardMaterial color={COLORS.ground} />
            </mesh>
        </group>
    );
}

function RoadNetwork() {
    return (
        <group position={[0, 0.012, 0]}>
            <Road x={0} z={0} w={22} d={2.2} />
            <Road x={0} z={0} w={2.2} d={16} />
            <Road x={-5.2} z={-2.9} w={2.2} d={8.4} />
            <Road x={5.2} z={2.8} w={2.2} d={8.0} />
            <Road x={-7.0} z={4.6} w={6.8} d={2.0} />
            <Road x={6.8} z={-4.8} w={7.2} d={2.0} />
            <Road x={-6.8} z={-6.2} w={7.2} d={2.0} />
            <Road x={7.4} z={5.9} w={4.4} d={1.8} />

            <Crosswalk x={0} z={0} horizontal />
            <Crosswalk x={0} z={0} />
            <Crosswalk x={-5.2} z={-2.9} horizontal />
            <Crosswalk x={5.2} z={2.8} />
            <Crosswalk x={-7.0} z={4.6} horizontal />
            <Crosswalk x={6.8} z={-4.8} horizontal />
        </group>
    );
}

function Road({
    x,
    z,
    w,
    d,
}: {
    x: number;
    z: number;
    w: number;
    d: number;
}) {
    const horizontal = w > d;

    return (
        <group position={[x, 0, z]}>
            <mesh receiveShadow>
                <boxGeometry args={[w, 0.03, d]} />
                <meshStandardMaterial color={COLORS.asphalt} />
            </mesh>

            {/* Lane dividers */}
            {horizontal ? (
                <mesh position={[0, 0.017, 0]}>
                    <boxGeometry args={[w * 0.75, 0.006, 0.05]} />
                    <meshStandardMaterial color={COLORS.divider} />
                </mesh>
            ) : (
                <mesh position={[0, 0.017, 0]}>
                    <boxGeometry args={[0.05, 0.006, d * 0.75]} />
                    <meshStandardMaterial color={COLORS.divider} />
                </mesh>
            )}
        </group>
    );
}

function Crosswalk({
    x,
    z,
    horizontal = false,
}: {
    x: number;
    z: number;
    horizontal?: boolean;
}) {
    const stripes = new Array(6).fill(0);

    return (
        <group position={[x, 0.03, z]}>
            {stripes.map((_, i) => {
                const offset = -0.55 + i * 0.22;

                return horizontal ? (
                    <mesh key={i} position={[offset, 0, 0]}>
                        <boxGeometry args={[0.12, 0.01, 1.5]} />
                        <meshStandardMaterial color="#F9FCFB" />
                    </mesh>
                ) : (
                    <mesh key={i} position={[0, 0, offset]}>
                        <boxGeometry args={[1.5, 0.01, 0.12]} />
                        <meshStandardMaterial color="#F9FCFB" />
                    </mesh>
                );
            })}
        </group>
    );
}

function OfficeBuildings() {
    return (
        <group>
            {BUILDINGS.map((b, index) => (
                <Building
                    key={index}
                    x={b.x}
                    z={b.z}
                    w={b.w}
                    d={b.d}
                    height={b.height}
                    bodyColor={b.body}
                    glassColor={b.glass}
                />
            ))}
        </group>
    );
}

function ResidentialHouses() {
    return (
        <group>
            {HOUSES.map((house, index) => (
                <House
                    key={index}
                    x={house.x}
                    z={house.z}
                    w={house.w}
                    d={house.d}
                    h={house.h}
                />
            ))}
        </group>
    );
}

function Building({
    x,
    z,
    w,
    d,
    height,
    bodyColor,
    glassColor,
}: {
    x: number;
    z: number;
    w: number;
    d: number;
    height: number;
    bodyColor: string;
    glassColor: string;
}) {
    return (
        <group position={[x, 0, z]}>
            {/* plinth */}
            <mesh receiveShadow position={[0, 0.1, 0]}>
                <boxGeometry args={[w + 0.45, 0.2, d + 0.45]} />
                <meshStandardMaterial color="#E7ECE9" />
            </mesh>

            <mesh castShadow receiveShadow position={[0, height / 2 + 0.2, 0]}>
                <boxGeometry args={[w, height, d]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>

            {/* roof */}
            <mesh castShadow position={[0, height + 0.33, 0]}>
                <boxGeometry args={[w + 0.18, 0.16, d + 0.18]} />
                <meshStandardMaterial color={COLORS.roof} />
            </mesh>

            {/* roof details */}
            <mesh position={[-0.35, height + 0.48, -0.25]}>
                <boxGeometry args={[0.35, 0.18, 0.35]} />
                <meshStandardMaterial color="#D6DFDD" />
            </mesh>

            <mesh position={[0.35, height + 0.48, 0.25]}>
                <boxGeometry args={[0.45, 0.18, 0.4]} />
                <meshStandardMaterial color="#D6DFDD" />
            </mesh>

            {/* entrance */}
            <mesh position={[0, 0.58, d / 2 + 0.01]}>
                <boxGeometry args={[0.48, 1.1, 0.05]} />
                <meshStandardMaterial color="#3E6971" />
            </mesh>

            <WindowGrid
                width={w}
                depth={d}
                height={height}
                color={glassColor}
            />
        </group>
    );
}

function WindowGrid({
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
    const rows = Math.max(3, Math.floor(height / 0.9));
    const colsFront = Math.max(3, Math.floor(width / 0.48));
    const colsSide = Math.max(2, Math.floor(depth / 0.48));

    const frontXs = new Array(colsFront).fill(0).map((_, i) =>
        -width / 2 + 0.28 + i * ((width - 0.56) / Math.max(colsFront - 1, 1))
    );

    const sideZs = new Array(colsSide).fill(0).map((_, i) =>
        -depth / 2 + 0.28 + i * ((depth - 0.56) / Math.max(colsSide - 1, 1))
    );

    const ys = new Array(rows).fill(0).map((_, i) => 0.95 + i * 0.82);

    return (
        <group>
            {ys.map((y, row) =>
                frontXs.map((x, col) => (
                    <group key={`front-${row}-${col}`}>
                        <mesh position={[x, y, depth / 2 + 0.011]}>
                            <planeGeometry args={[0.22, 0.34]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh
                            rotation={[0, Math.PI, 0]}
                            position={[x, y, -depth / 2 - 0.011]}
                        >
                            <planeGeometry args={[0.22, 0.34]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                    </group>
                ))
            )}

            {ys.map((y, row) =>
                sideZs.map((z, col) => (
                    <group key={`side-${row}-${col}`}>
                        <mesh
                            rotation={[0, Math.PI / 2, 0]}
                            position={[width / 2 + 0.011, y, z]}
                        >
                            <planeGeometry args={[0.22, 0.34]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh
                            rotation={[0, -Math.PI / 2, 0]}
                            position={[-width / 2 - 0.011, y, z]}
                        >
                            <planeGeometry args={[0.22, 0.34]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                    </group>
                ))
            )}
        </group>
    );
}

function House({
    x,
    z,
    w,
    d,
    h,
}: {
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
}) {
    return (
        <group position={[x, 0, z]}>
            <mesh receiveShadow position={[0, 0.08, 0]}>
                <boxGeometry args={[w + 0.35, 0.16, d + 0.35]} />
                <meshStandardMaterial color="#EBEFEC" />
            </mesh>

            <mesh castShadow receiveShadow position={[0, h / 2 + 0.16, 0]}>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={COLORS.houseBody} />
            </mesh>

            <mesh castShadow position={[0, h + 0.38, 0]}>
                <boxGeometry args={[w + 0.18, 0.26, d + 0.18]} />
                <meshStandardMaterial color={Math.random() > 0.5 ? COLORS.houseRoof : COLORS.houseRoofDark} />
            </mesh>

            <mesh position={[0, 0.55, d / 2 + 0.011]}>
                <boxGeometry args={[0.38, 0.75, 0.05]} />
                <meshStandardMaterial color="#3D646A" />
            </mesh>

            {/* front windows */}
            <mesh position={[-0.45, 0.9, d / 2 + 0.011]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>
            <mesh position={[0.45, 0.9, d / 2 + 0.011]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>

            {/* back windows */}
            <mesh rotation={[0, Math.PI, 0]} position={[-0.45, 0.9, -d / 2 - 0.011]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>
            <mesh rotation={[0, Math.PI, 0]} position={[0.45, 0.9, -d / 2 - 0.011]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>

            {/* side windows */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[w / 2 + 0.011, 0.9, 0]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>
            <mesh rotation={[0, -Math.PI / 2, 0]} position={[-w / 2 - 0.011, 0.9, 0]}>
                <planeGeometry args={[0.34, 0.34]} />
                <meshStandardMaterial color="#9FD9DB" />
            </mesh>
        </group>
    );
}

function Hospital() {
    return (
        <group position={[8.8, 5.6, 0]}>
            <mesh receiveShadow position={[0, 0.1, 0]}>
                <boxGeometry args={[2.9, 0.2, 2.8]} />
                <meshStandardMaterial color="#E5EBE8" />
            </mesh>

            <mesh castShadow receiveShadow position={[0, 2.8, 0]}>
                <boxGeometry args={[2.5, 5.2, 2.4]} />
                <meshStandardMaterial color={COLORS.hospitalBody} />
            </mesh>

            <mesh castShadow position={[0, 5.48, 0]}>
                <boxGeometry args={[2.75, 0.18, 2.65]} />
                <meshStandardMaterial color="#DFECE8" />
            </mesh>

            <WindowGrid width={2.5} depth={2.4} height={5.2} color={COLORS.hospitalGlass} />

            {/* helipad */}
            <mesh position={[0, 5.62, 0]}>
                <cylinderGeometry args={[0.82, 0.82, 0.03, 32]} />
                <meshStandardMaterial color={COLORS.hospitalHelipad} />
            </mesh>

            <mesh position={[0, 5.65, 0]}>
                <boxGeometry args={[0.55, 0.03, 0.14]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 5.65, 0]}>
                <boxGeometry args={[0.14, 0.03, 0.55]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
        </group>
    );
}

function FireStation() {
    return (
        <group position={[-9.1, -1.6, 0]}>
            <mesh receiveShadow position={[0, 0.08, 0]}>
                <boxGeometry args={[2.8, 0.16, 2.4]} />
                <meshStandardMaterial color="#E7ECE8" />
            </mesh>

            <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
                <boxGeometry args={[2.45, 1.8, 2.1]} />
                <meshStandardMaterial color="#F6EFE8" />
            </mesh>

            <mesh position={[0, 2.0, 0]}>
                <boxGeometry args={[2.65, 0.16, 2.3]} />
                <meshStandardMaterial color="#EDB19A" />
            </mesh>

            <mesh position={[-0.65, 0.7, 1.06]}>
                <boxGeometry args={[0.7, 1.1, 0.05]} />
                <meshStandardMaterial color="#4D7B81" />
            </mesh>

            <mesh position={[0.65, 0.7, 1.06]}>
                <boxGeometry args={[0.7, 1.1, 0.05]} />
                <meshStandardMaterial color="#4D7B81" />
            </mesh>
        </group>
    );
}

function Park() {
    return (
        <group position={[3.8, 5.0, 0]}>
            <mesh receiveShadow position={[0, 0.04, 0]}>
                <boxGeometry args={[4.2, 0.08, 3.0]} />
                <meshStandardMaterial color={COLORS.grass} />
            </mesh>

            {/* central fountain */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.08, 28]} />
                <meshStandardMaterial color="#DCECEA" />
            </mesh>

            <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.06, 28]} />
                <meshStandardMaterial color={COLORS.fountain} />
            </mesh>

            {/* paths */}
            <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[4.2, 0.02, 0.32]} />
                <meshStandardMaterial color="#E8ECE9" />
            </mesh>

            <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[0.32, 0.02, 3.0]} />
                <meshStandardMaterial color="#E8ECE9" />
            </mesh>

            {[
                [-1.35, -0.95],
                [1.3, -0.95],
                [-1.35, 0.95],
                [1.3, 0.95],
            ].map(([x, z], i) => (
                <Tree key={i} x={x} z={z} />
            ))}
        </group>
    );
}

function CityTrees() {
    return (
        <group>
            {TREE_POINTS.map(([x, z], index) => (
                <Tree key={index} x={x} z={z} />
            ))}
        </group>
    );
}

function Tree({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.08, 0.11, 0.9, 8]} />
                <meshStandardMaterial color={COLORS.trunk} />
            </mesh>

            <mesh castShadow position={[0, 1.08, 0]}>
                <sphereGeometry args={[0.32, 18, 18]} />
                <meshStandardMaterial color={COLORS.treeLeaf} />
            </mesh>

            <mesh castShadow position={[-0.18, 1.0, 0.08]}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial color={COLORS.treeLeafLight} />
            </mesh>

            <mesh castShadow position={[0.18, 1.0, -0.05]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={COLORS.treeLeafDark} />
            </mesh>
        </group>
    );
}

function StreetLights() {
    return (
        <group>
            {STREET_LIGHTS.map(([x, z], index) => (
                <StreetLamp key={index} x={x} z={z} />
            ))}
        </group>
    );
}

function StreetLamp({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.72, 0]}>
                <cylinderGeometry args={[0.035, 0.05, 1.44, 8]} />
                <meshStandardMaterial color={COLORS.lamp} />
            </mesh>

            <mesh position={[0.16, 1.42, 0]}>
                <boxGeometry args={[0.3, 0.04, 0.04]} />
                <meshStandardMaterial color={COLORS.lamp} />
            </mesh>

            <mesh position={[0.29, 1.35, 0]}>
                <boxGeometry args={[0.08, 0.12, 0.08]} />
                <meshStandardMaterial color={COLORS.lampGlow} emissive={COLORS.lampGlow} emissiveIntensity={0.35} />
            </mesh>
        </group>
    );
}

function TrafficLights() {
    return (
        <group>
            {TRAFFIC_LIGHTS.map(([x, z], index) => (
                <TrafficLight key={index} x={x} z={z} />
            ))}
        </group>
    );
}

function TrafficLight({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.78, 0]}>
                <cylinderGeometry args={[0.04, 0.05, 1.56, 8]} />
                <meshStandardMaterial color="#39474D" />
            </mesh>

            <mesh castShadow position={[0.16, 1.32, 0]}>
                <boxGeometry args={[0.18, 0.48, 0.18]} />
                <meshStandardMaterial color="#2A363B" />
            </mesh>

            <mesh position={[0.19, 1.44, 0.095]}>
                <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
                <meshStandardMaterial color="#EE6550" emissive="#EE6550" emissiveIntensity={0.35} />
            </mesh>

            <mesh position={[0.19, 1.32, 0.095]}>
                <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
                <meshStandardMaterial color="#EDC05A" emissive="#EDC05A" emissiveIntensity={0.22} />
            </mesh>

            <mesh position={[0.19, 1.2, 0.095]}>
                <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
                <meshStandardMaterial color="#3EC883" emissive="#3EC883" emissiveIntensity={0.28} />
            </mesh>
        </group>
    );
}

function StaticVehicles() {
    return (
        <group>
            <Car x={-2.6} z={0.95} rotationY={0} color="#F4C157" />
            <Car x={1.7} z={-0.95} rotationY={Math.PI} color="#57B3C5" />
            <Sedan x={6.6} z={-4.8} rotationY={0} color="#FFFFFF" />
            <Sedan x={-6.8} z={4.6} rotationY={0} color="#FFFFFF" />
            <Bus x={7.7} z={5.9} rotationY={0} color="#DFF4F5" />
            <Ambulance x={8.0} z={4.9} rotationY={0} />
            <FireTruck x={-8.9} z={-0.1} rotationY={Math.PI / 2} />
            <UtilityVan x={-4.4} z={-2.8} rotationY={Math.PI / 2} color="#EDEFEF" />
        </group>
    );
}

function Car({
    x,
    z,
    rotationY = 0,
    color,
}: {
    x: number;
    z: number;
    rotationY?: number;
    color: string;
}) {
    return (
        <group position={[x, 0.16, z]} rotation={[0, rotationY, 0]}>
            <VehicleBase bodyColor={color} />
        </group>
    );
}

function Sedan({
    x,
    z,
    rotationY = 0,
    color,
}: {
    x: number;
    z: number;
    rotationY?: number;
    color: string;
}) {
    return (
        <group position={[x, 0.16, z]} rotation={[0, rotationY, 0]}>
            <VehicleBase bodyColor={color} />
            <mesh position={[-0.18, 0.32, 0]}>
                <boxGeometry args={[0.45, 0.15, 0.58]} />
                <meshStandardMaterial color="#A5D8DD" />
            </mesh>
        </group>
    );
}

function Bus({
    x,
    z,
    rotationY = 0,
    color,
}: {
    x: number;
    z: number;
    rotationY?: number;
    color: string;
}) {
    return (
        <group position={[x, 0.18, z]} rotation={[0, rotationY, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1.65, 0.32, 0.62]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
                <boxGeometry args={[1.25, 0.28, 0.56]} />
                <meshStandardMaterial color="#B7E4E5" />
            </mesh>
            <Wheel x={-0.55} z={0.33} />
            <Wheel x={0.55} z={0.33} />
            <Wheel x={-0.55} z={-0.33} />
            <Wheel x={0.55} z={-0.33} />
        </group>
    );
}

function UtilityVan({
    x,
    z,
    rotationY = 0,
    color = "#EFEFEF",
}: {
    x: number;
    z: number;
    rotationY?: number;
    color?: string;
}) {
    return (
        <group position={[x, 0.18, z]} rotation={[0, rotationY, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1.0, 0.34, 0.62]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.18, 0.22, 0]}>
                <boxGeometry args={[0.42, 0.22, 0.58]} />
                <meshStandardMaterial color="#BCE4E3" />
            </mesh>
            <Wheel x={-0.32} z={0.34} />
            <Wheel x={0.32} z={0.34} />
            <Wheel x={-0.32} z={-0.34} />
            <Wheel x={0.32} z={-0.34} />
        </group>
    );
}

function Ambulance({
    x,
    z,
    rotationY = 0,
}: {
    x: number;
    z: number;
    rotationY?: number;
}) {
    return (
        <group position={[x, 0.18, z]} rotation={[0, rotationY, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1.1, 0.34, 0.62]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0.15, 0.23, 0]}>
                <boxGeometry args={[0.45, 0.24, 0.58]} />
                <meshStandardMaterial color="#B9E7EC" />
            </mesh>
            <mesh position={[-0.08, 0.2, 0.315]}>
                <boxGeometry args={[0.22, 0.1, 0.03]} />
                <meshStandardMaterial color="#E25D4D" />
            </mesh>
            <mesh position={[-0.08, 0.2, -0.315]}>
                <boxGeometry args={[0.22, 0.1, 0.03]} />
                <meshStandardMaterial color="#E25D4D" />
            </mesh>
            <Wheel x={-0.35} z={0.34} />
            <Wheel x={0.35} z={0.34} />
            <Wheel x={-0.35} z={-0.34} />
            <Wheel x={0.35} z={-0.34} />
        </group>
    );
}

function FireTruck({
    x,
    z,
    rotationY = 0,
}: {
    x: number;
    z: number;
    rotationY?: number;
}) {
    return (
        <group position={[x, 0.2, z]} rotation={[0, rotationY, 0]}>
            <mesh castShadow>
                <boxGeometry args={[1.3, 0.36, 0.68]} />
                <meshStandardMaterial color="#D85645" />
            </mesh>
            <mesh position={[0.25, 0.24, 0]}>
                <boxGeometry args={[0.4, 0.24, 0.62]} />
                <meshStandardMaterial color="#BFE8EA" />
            </mesh>
            <mesh position={[-0.15, 0.33, 0]}>
                <boxGeometry args={[0.62, 0.05, 0.45]} />
                <meshStandardMaterial color="#E6D9B1" />
            </mesh>
            <Wheel x={-0.45} z={0.37} />
            <Wheel x={0.45} z={0.37} />
            <Wheel x={-0.45} z={-0.37} />
            <Wheel x={0.45} z={-0.37} />
        </group>
    );
}

function VehicleBase({ bodyColor }: { bodyColor: string }) {
    return (
        <group>
            <mesh castShadow>
                <boxGeometry args={[0.92, 0.28, 0.58]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0.15, 0.18, 0]}>
                <boxGeometry args={[0.42, 0.18, 0.54]} />
                <meshStandardMaterial color="#B9E4E7" />
            </mesh>
            <Wheel x={-0.28} z={0.31} />
            <Wheel x={0.28} z={0.31} />
            <Wheel x={-0.28} z={-0.31} />
            <Wheel x={0.28} z={-0.31} />
        </group>
    );
}

function Wheel({ x, z }: { x: number; z: number }) {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[x, -0.1, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
            <meshStandardMaterial color="#2C2F33" />
        </mesh>
    );
}

function IncidentVisual({
    incidentId,
    type,
    position,
    color,
    selected,
    status,
    onSelectIncident,
}: {
    incidentId: string;
    type: "road-obstruction" | "water-leak" | "signal-failure";
    position: [number, number, number];
    color: string;
    selected: boolean;
    status: IncidentStatus | null;
    onSelectIncident?: (incidentId: string) => void;
}) {
    const resolved = status === "Resolved";

    return (
        <group
            position={position}
            onClick={() => onSelectIncident?.(incidentId)}
        >
            <IncidentBeacon color={resolved ? COLORS.resolved : color} selected={selected} />

            {type === "road-obstruction" && (
                <RoadObstruction resolved={resolved} />
            )}

            {type === "water-leak" && (
                <WaterLeak resolved={resolved} />
            )}

            {type === "signal-failure" && (
                <SignalFailure resolved={resolved} />
            )}
        </group>
    );
}

function IncidentBeacon({
    color,
    selected,
}: {
    color: string;
    selected: boolean;
}) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.08;
        ref.current.scale.setScalar(selected ? pulse * 1.2 : pulse);
    });

    return (
        <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.18}>
            <mesh ref={ref} position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.18, 20, 20]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} />
            </mesh>
            <mesh position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.22, 0.33, 36]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} />
            </mesh>
        </Float>
    );
}

function RoadObstruction({ resolved }: { resolved: boolean }) {
    return (
        <group>
            {!resolved ? (
                <>
                    <mesh position={[0, 0.16, 0]}>
                        <boxGeometry args={[1.05, 0.18, 0.42]} />
                        <meshStandardMaterial color="#D7A05B" />
                    </mesh>

                    <mesh position={[-0.25, 0.28, 0.08]}>
                        <boxGeometry args={[0.22, 0.22, 0.22]} />
                        <meshStandardMaterial color="#C88445" />
                    </mesh>

                    <mesh position={[0.1, 0.28, -0.06]}>
                        <boxGeometry args={[0.22, 0.22, 0.22]} />
                        <meshStandardMaterial color="#BB7940" />
                    </mesh>

                    <mesh position={[0.55, 0.24, 0]}>
                        <boxGeometry args={[0.32, 0.32, 0.08]} />
                        <meshStandardMaterial color={COLORS.barricade} />
                    </mesh>

                    <mesh position={[-0.55, 0.24, 0]}>
                        <boxGeometry args={[0.32, 0.32, 0.08]} />
                        <meshStandardMaterial color={COLORS.barricade} />
                    </mesh>

                    <TrafficCone x={0.62} z={0.25} />
                    <TrafficCone x={0.62} z={-0.25} />
                    <TrafficCone x={-0.62} z={0.25} />
                    <TrafficCone x={-0.62} z={-0.25} />
                </>
            ) : (
                <UtilityVan x={0.85} z={0.0} rotationY={Math.PI / 2} color="#F2F5F5" />
            )}
        </group>
    );
}

function WaterLeak({ resolved }: { resolved: boolean }) {
    return (
        <group>
            {!resolved ? (
                <>
                    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.44, 24]} />
                        <meshStandardMaterial color={COLORS.water} />
                    </mesh>

                    <mesh position={[0.2, 0.09, -0.1]}>
                        <sphereGeometry args={[0.08, 14, 14]} />
                        <meshStandardMaterial color={COLORS.water} emissive={COLORS.water} emissiveIntensity={0.18} />
                    </mesh>

                    <UtilityVan x={0.9} z={0.15} rotationY={Math.PI / 2} color="#F9FBFB" />
                </>
            ) : (
                <mesh position={[0, 0.03, 0]}>
                    <boxGeometry args={[0.75, 0.05, 0.75]} />
                    <meshStandardMaterial color="#B4C1B7" />
                </mesh>
            )}
        </group>
    );
}

function SignalFailure({ resolved }: { resolved: boolean }) {
    return (
        <group>
            {!resolved ? (
                <>
                    <mesh castShadow position={[0, 0.78, 0]}>
                        <cylinderGeometry args={[0.04, 0.05, 1.56, 8]} />
                        <meshStandardMaterial color="#39474D" />
                    </mesh>

                    <mesh castShadow rotation={[0, 0, 0.18]} position={[0.14, 1.25, 0]}>
                        <boxGeometry args={[0.18, 0.48, 0.18]} />
                        <meshStandardMaterial color="#2A363B" />
                    </mesh>

                    <UtilityVan x={0.9} z={0.0} rotationY={Math.PI / 2} color="#F1F4F4" />
                </>
            ) : (
                <TrafficLight x={0} z={0} />
            )}
        </group>
    );
}

function TrafficCone({ x, z }: { x: number; z: number }) {
    return (
        <group position={[x, 0.07, z]}>
            <mesh>
                <cylinderGeometry args={[0.04, 0.1, 0.16, 12]} />
                <meshStandardMaterial color={COLORS.cone} />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
                <meshStandardMaterial color="#FFE7D9" />
            </mesh>
        </group>
    );
}