
import { useMemo } from "react";

import {
    CITY,
    PALETTE,
} from "../city-world/cityLayout";

import {
    isDrivable,
    type Position2,
} from "./gameConfig";

const MAP_SIZE = 224;
const GRID_MIN = -22;
const GRID_MAX = 22;
const GRID_SIZE = GRID_MAX - GRID_MIN + 1;

const toSvg = (value: number) =>
    ((value + CITY.half) / CITY.size) * MAP_SIZE;

const cellKey = (x: number, z: number) =>
    z * GRID_SIZE + x;

function nearestDrivable(
    point: Position2
): [number, number] {
    let nearest: [number, number] = [22, 22];
    let best = Infinity;

    for (let z = 0; z < GRID_SIZE; z++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const wx = x + GRID_MIN;
            const wz = z + GRID_MIN;

            if (!isDrivable(wx, wz)) continue;

            const d = Math.hypot(
                wx - point.x,
                wz - point.z
            );

            if (d < best) {
                best = d;
                nearest = [x, z];
            }
        }
    }

    return nearest;
}

function findRoute(
    start: Position2,
    destination: Position2
): Position2[] {
    const [sx, sz] = nearestDrivable(start);
    const [ex, ez] = nearestDrivable(destination);

    const origin = cellKey(sx, sz);
    const goal = cellKey(ex, ez);

    const total = GRID_SIZE * GRID_SIZE;

    const visited = new Uint8Array(total);
    const parent = new Int32Array(total).fill(-1);
    const queue: number[] = [origin];

    visited[origin] = 1;
    let head = 0;

    while (head < queue.length) {
        const current = queue[head++];

        if (current === goal) break;

        const x = current % GRID_SIZE;
        const z = Math.floor(current / GRID_SIZE);

        const directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        for (const [dx, dz] of directions) {
            const nx = x + dx;
            const nz = z + dz;

            if (
                nx < 0 ||
                nz < 0 ||
                nx >= GRID_SIZE ||
                nz >= GRID_SIZE
            ) {
                continue;
            }

            if (
                !isDrivable(
                    nx + GRID_MIN,
                    nz + GRID_MIN
                )
            ) {
                continue;
            }

            const key = cellKey(nx, nz);

            if (visited[key]) continue;

            visited[key] = 1;
            parent[key] = current;
            queue.push(key);
        }
    }

    if (!visited[goal]) {
        return [start, destination];
    }

    const route: Position2[] = [];

    for (
        let current = goal;
        current !== -1;
        current = parent[current]
    ) {
        route.push({
            x: (current % GRID_SIZE) + GRID_MIN,
            z: Math.floor(current / GRID_SIZE) + GRID_MIN,
        });
    }

    route.reverse();

    return [start, ...route, destination];
}

export default function MiniMap({
    player,
    target,
    heading,
}: {
    player: Position2;
    target: Position2;
    heading: number;
}) {
    const px = Math.round(player.x);
    const pz = Math.round(player.z);

    const route = useMemo(
        () =>
            findRoute({ x: px, z: pz }, target),
        [px, pz, target.x, target.z]
    );

    const path = route
        .map((point) => `${toSvg(point.x)},${toSvg(point.z)}`)
        .join(" ");

    return (
        <div className="overflow-hidden rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFDF7]/95 shadow-[3px_4px_0_#1B1F3B]">
            <div className="flex items-center justify-between bg-[#FFC93C] px-3 py-2 text-[10px] font-extrabold">
                <span>ROUTE MAP</span>
                <span>EXPANDED CITY</span>
            </div>

            <svg
                viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
                className="block h-[174px] w-[174px] sm:h-[208px] sm:w-[208px]"
                role="img"
                aria-label="City minimap with ambulance, roads, and mission route"
            >
                <rect
                    width={MAP_SIZE}
                    height={MAP_SIZE}
                    fill="#CFE4C6"
                />

                {/* All city roads */}
                {CITY.roads.map((road) => (
                    <g key={road}>
                        <rect
                            x={toSvg(road - CITY.roadWidth / 2)}
                            y={0}
                            width={
                                toSvg(road + CITY.roadWidth / 2) -
                                toSvg(road - CITY.roadWidth / 2)
                            }
                            height={MAP_SIZE}
                            fill={PALETTE.road}
                        />

                        <rect
                            x={0}
                            y={toSvg(road - CITY.roadWidth / 2)}
                            width={MAP_SIZE}
                            height={
                                toSvg(road + CITY.roadWidth / 2) -
                                toSvg(road - CITY.roadWidth / 2)
                            }
                            fill={PALETTE.road}
                        />
                    </g>
                ))}

                {/* Central hospital */}
                <rect
                    x={toSvg(-13.2)}
                    y={toSvg(-13.2)}
                    width={toSvg(-9.3) - toSvg(-13.2)}
                    height={toSvg(-9.3) - toSvg(-13.2)}
                    fill="#FFFDF7"
                    stroke="#D65249"
                    strokeWidth={1.5}
                    rx={2}
                />

                <text
                    x={toSvg(-11.25)}
                    y={toSvg(-11.25) + 3}
                    fontSize={9}
                    fontWeight="bold"
                    fill="#D65249"
                    textAnchor="middle"
                >
                    H
                </text>

                {/* Suggested street route */}
                <polyline
                    points={path}
                    fill="none"
                    stroke="#182439"
                    strokeWidth={6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.45}
                />

                <polyline
                    points={path}
                    fill="none"
                    stroke="#FFC93C"
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Destination marker */}
                <circle
                    cx={toSvg(target.x)}
                    cy={toSvg(target.z)}
                    r={8}
                    fill="#FF5A4E"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                />

                <circle
                    cx={toSvg(target.x)}
                    cy={toSvg(target.z)}
                    r={2}
                    fill="white"
                />

                {/* Ambulance arrow */}
                <g
                    transform={`translate(${toSvg(player.x)} ${toSvg(player.z)}) rotate(${180 - (heading * 180) / Math.PI
                        })`}
                >
                    <path
                        d="M0 -11 L8 8 L0 5 L-8 8 Z"
                        fill="#2EC4B6"
                        stroke="#1B1F3B"
                        strokeWidth={2}
                    />
                </g>
            </svg>

            <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] font-bold">
                <span>
                    <span className="text-[#22978B]">▲</span> YOU
                </span>
                <span>
                    <span className="text-[#FF5A4E]">●</span> TARGET
                </span>
            </div>
        </div>
    );
}
