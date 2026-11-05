
import { CITY } from "../city-world/cityLayout";

export type TravelAxis = "NS" | "EW";
export type SignalColor = "red" | "yellow" | "green";

export type TrafficLightState = {
    northSouth: SignalColor;
    eastWest: SignalColor;
    secondsRemaining: number;
};

export const SIGNAL_TIMING = {
    northSouthGreen: 8,
    northSouthYellow: 2,
    eastWestGreen: 8,
    eastWestYellow: 2,
} as const;

export const SIGNAL_CYCLE =
    SIGNAL_TIMING.northSouthGreen +
    SIGNAL_TIMING.northSouthYellow +
    SIGNAL_TIMING.eastWestGreen +
    SIGNAL_TIMING.eastWestYellow;

export const STOP_LINE_DISTANCE = 2.65;
export const INTERSECTION_APPROACH = 6.5;

function normalizeTime(value: number): number {
    return (
        ((value % SIGNAL_CYCLE) + SIGNAL_CYCLE) %
        SIGNAL_CYCLE
    );
}

export function closestRoad(value: number): number {
    return CITY.roads.reduce((best, road) =>
        Math.abs(road - value) < Math.abs(best - value)
            ? road
            : best
    );
}

export function getIntersectionPhaseOffset(
    x: number,
    z: number
): number {
    const xi = CITY.roads.indexOf(closestRoad(x));
    const zi = CITY.roads.indexOf(closestRoad(z));

    // Neighboring intersections use slightly staggered cycles.
    // Both visuals and vehicles consume the same offset.
    return ((xi + zi) % 2) * 2;
}

export function getTrafficLightState(
    time: number,
    x: number,
    z: number
): TrafficLightState {
    const shiftedTime = normalizeTime(
        time + getIntersectionPhaseOffset(x, z)
    );

    const nsGreenEnd = SIGNAL_TIMING.northSouthGreen;
    const nsYellowEnd =
        nsGreenEnd + SIGNAL_TIMING.northSouthYellow;
    const ewGreenEnd =
        nsYellowEnd + SIGNAL_TIMING.eastWestGreen;

    if (shiftedTime < nsGreenEnd) {
        return {
            northSouth: "green",
            eastWest: "red",
            secondsRemaining: nsGreenEnd - shiftedTime,
        };
    }

    if (shiftedTime < nsYellowEnd) {
        return {
            northSouth: "yellow",
            eastWest: "red",
            secondsRemaining: nsYellowEnd - shiftedTime,
        };
    }

    if (shiftedTime < ewGreenEnd) {
        return {
            northSouth: "red",
            eastWest: "green",
            secondsRemaining: ewGreenEnd - shiftedTime,
        };
    }

    return {
        northSouth: "red",
        eastWest: "yellow",
        secondsRemaining: SIGNAL_CYCLE - shiftedTime,
    };
}

export function getSignalForAxis(
    time: number,
    x: number,
    z: number,
    axis: TravelAxis
): SignalColor {
    const state = getTrafficLightState(time, x, z);

    return axis === "NS"
        ? state.northSouth
        : state.eastWest;
}

export function canEnterIntersection(
    time: number,
    x: number,
    z: number,
    axis: TravelAxis
): boolean {
    return (
        getSignalForAxis(time, x, z, axis) === "green"
    );
}

export function getAxisFromDirection(
    dx: number,
    dz: number
): TravelAxis {
    return Math.abs(dx) > Math.abs(dz) ? "EW" : "NS";
}
