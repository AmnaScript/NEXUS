
import { useMemo } from "react";
import {
    isDrivable,
    type Position2,
} from "./gameConfig";

const GRID_MIN = -14;
const GRID_MAX = 14;
const GRID_SIZE = GRID_MAX - GRID_MIN + 1;

const MAP_SIZE = 212;

const roadCenters = [-7.5, 0, 7.5];

const toSvg = (value: number) =>
    ((value + 15) / 30) * MAP_SIZE;

const cellKey = (x: number, z: number) =>
    z * GRID_SIZE + x;

function nearestDrivable(
    point: Position2
): [number, number] {
    let nearest: [number, number] = [14, 14];
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

function findRoadRoute(
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

    // Breadth-first search through drivable cells.
    while (head < queue.length) {
        const current = queue[head++];

        if (current === goal) break;

        const x = current % GRID_SIZE;
        const z = Math.floor(current / GRID_SIZE);

        for (const [dx, dz] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const nx = x + dx;
            const nz = z + dz;

            if (
                nx < 0 ||
                nx >= GRID_SIZE ||
                nz < 0 ||
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

    // Fallback: show direct target direction.
    if (!visited[goal]) {
        return [start, destination];
    }

    const result: Position2[] = [];

    for (
        let curr = goal;
        curr !== -1;
        curr = parent[curr]
    ) {
        result.push({
            x: (curr % GRID_SIZE) + GRID_MIN,
            z: Math.floor(curr / GRID_SIZE) + GRID_MIN,
        });
    }

    result.reverse();

    return [
        start,
        ...result,
        destination,
    ];
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
    // Recalculate only after crossing a whole grid cell.
    const px = Math.round(player.x);
    const pz = Math.round(player.z);

    const route = useMemo(
        () =>
            findRoadRoute(
                { x: px, z: pz },
                target
            ),
        [px, pz, target.x, target.z]
    );

    const path = route
        .map(
            (point) =>
                `${toSvg(point.x)},${toSvg(point.z)}`
        )
        .join(" ");

    return (
        <div className="overflow-hidden rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFDF7]/95 shadow-[3px_4px_0_#1B1F3B]">
            <div className="flex items-center justify-between bg-[#FFC93C] px-3 py-2 text-[11px] font-extrabold">
                <span>ROUTE MAP</span>
                <span>30 × 30 DISTRICT</span>
            </div>

            <svg
                viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
                className="block h-[170px] w-[170px] sm:h-[204px] sm:w-[204px]"
                role="img"
                aria-label="Top-down road map showing ambulance, target and suggested route"
            >
                <rect
                    width={MAP_SIZE}
                    height={MAP_SIZE}
                    fill="#DBE9D4"
                />

                {/* Road grid */}
                {roadCenters.map((value) => (
                    <g key={value}>
                        <rect
                            x={toSvg(value - 1.16)}
                            y="0"
                            width={
                                toSvg(value + 1.16) -
                                toSvg(value - 1.16)
                            }
                            height={MAP_SIZE}
                            fill="#53616E"
                        />

                        <rect
                            x="0"
                            y={toSvg(value - 1.16)}
                            width={MAP_SIZE}
                            height={
                                toSvg(value + 1.16) -
                                toSvg(value - 1.16)
                            }
                            fill="#53616E"
                        />
                    </g>
                ))}

                {/* Route outline */}
                <polyline
                    points={path}
                    fill="none"
                    stroke="#1B1F3B"
                    strokeWidth="6"
                    opacity="0.42"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Yellow navigation route */}
                <polyline
                    points={path}
                    fill="none"
                    stroke="#FFC93C"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Destination */}
                <circle
                    cx={toSvg(target.x)}
                    cy={toSvg(target.z)}
                    r="9"
                    fill="#FF5A4E"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                />

                <circle
                    cx={toSvg(target.x)}
                    cy={toSvg(target.z)}
                    r="2"
                    fill="#FFFFFF"
                />

                {/* Player direction */}
                <g
                    transform={`translate(${toSvg(player.x)} ${toSvg(player.z)}) rotate(${180 - (heading * 180) / Math.PI
                        })`}
                >
                    <path
                        d="M0 -11 L8 9 L0 5 L-8 9 Z"
                        fill="#2EC4B6"
                        stroke="#1B1F3B"
                        strokeWidth="2"
                    />
                </g>
            </svg>

            <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold">
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
