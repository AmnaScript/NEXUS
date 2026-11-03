
import {
  CITY,
  ROAD_HALF_WIDTH,
  WORLD_DRIVE_LIMIT,
} from "../city-world/cityLayout";

export type InputKey =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "brake";

export type MissionStage = "pickup" | "hospital";

export type GameMode =
  | "menu"
  | "playing"
  | "paused"
  | "result"
  | "gameover";

export type Position2 = { x: number; z: number };

// Preserve original missions and ambulance spawn.
export const START: Position2 = { x: -7.5, z: 7.5 };

export const HOSPITAL: Position2 = {
  x: -11.25,
  z: -7.5,
};

export const PICKUPS: Position2[] = [
  { x: 7.5, z: 0 },
  { x: 0, z: -7.5 },
  { x: 7.5, z: 7.5 },
];

export const LIMITS = {
  half: WORLD_DRIVE_LIMIT,
  roadHalfWidth: ROAD_HALF_WIDTH,
  pickupRadius: 1.55,
};

export const TOTAL_MISSIONS = PICKUPS.length;

export const KEY_MAP: Record<string, InputKey | undefined> = {
  w: "forward",
  arrowup: "forward",
  s: "back",
  arrowdown: "back",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
  " ": "brake",
};

export const closestRoadDistance = (value: number) =>
  Math.min(
    ...CITY.roads.map((road) => Math.abs(value - road))
  );

export function isDrivable(x: number, z: number) {
  if (
    Math.abs(x) > LIMITS.half ||
    Math.abs(z) > LIMITS.half
  ) {
    return false;
  }

  return (
    closestRoadDistance(x) <= LIMITS.roadHalfWidth ||
    closestRoadDistance(z) <= LIMITS.roadHalfWidth
  );
}

export function distance(a: Position2, b: Position2) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
