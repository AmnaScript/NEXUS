
export type Point2 = readonly [number, number];
export type Point3 = readonly [number, number, number];

export const CITY = {
    size: 45,
    half: 22.5,
    roads: [-15, -7.5, 0, 7.5, 15] as readonly number[],
    roadWidth: 3.7,
    sidewalkHeight: 0.17,
    background: "#FFF6E5",
} as const;

export const PALETTE = {
    cream: "#FFF6E5",
    paper: "#FFFCF4",
    ink: "#1B1F3B",
    red: "#FF5A4E",
    yellow: "#FFC93C",
    green: "#3DBE7A",
    teal: "#2EC4B6",
    coral: "#FF8F7A",
    road: "#53616E",
    pavement: "#DED7C5",
    curb: "#C2BAA8",
    grass: "#99CC8A",
    water: "#6CC9E5",
    glass: "#91DCE1",
} as const;

export const DISTRICTS = {
    hospital: [-11.25, -11.25] as Point2,
    downtownWest: [-3.75, -11.25] as Point2,
    downtownEast: [3.75, -11.25] as Point2,
    fireStation: [11.25, -11.25] as Point2,

    police: [-11.25, -3.75] as Point2,
    offices: [-3.75, -3.75] as Point2,
    apartments: [3.75, -3.75] as Point2,
    cafe: [11.25, -3.75] as Point2,

    residentialA: [-11.25, 3.75] as Point2,
    shops: [-3.75, 3.75] as Point2,
    residentialB: [3.75, 3.75] as Point2,
    residentialC: [11.25, 3.75] as Point2,

    residentialD: [-11.25, 11.25] as Point2,
    market: [-3.75, 11.25] as Point2,
    houses: [3.75, 11.25] as Point2,
    park: [11.25, 11.25] as Point2,
} as const;

export const CITY_LOCATIONS = {
    hospitalEntrance: [-11.25, -8.72] as Point2,
    fireStationEntrance: [11.25, -8.72] as Point2,
    policeEntrance: [-11.25, -6.1] as Point2,
    cafeEntrance: [11.25, -1.15] as Point2,
    parkEntrance: [11.25, 8.75] as Point2,
} as const;

export const ROAD_INTERSECTIONS: Point2[] =
    CITY.roads.flatMap((x) =>
        CITY.roads.map((z) => [x, z] as Point2)
    );

export const ROAD_LANE_OFFSET = 0.85;

export const BLOCK_CENTERS = [
    -18.75,
    -11.25,
    -3.75,
    3.75,
    11.25,
    18.75,
] as const;

export const ROAD_HALF_WIDTH = CITY.roadWidth / 2;
export const WORLD_DRIVE_LIMIT = CITY.half - 0.4;
