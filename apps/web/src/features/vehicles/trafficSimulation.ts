
import type { VehicleKind } from "./Vehicle";

export type TrafficSnapshot = {
    id: string;
    x: number;
    z: number;
    yaw: number;
    speed: number;
    kind: VehicleKind;
};

export type Point = {
    x: number;
    z: number;
};

type VehicleDimensions = {
    halfWidth: number;
    halfLength: number;
};

const DIMENSIONS: Record<VehicleKind, VehicleDimensions> = {
    sedan: { halfWidth: 0.48, halfLength: 0.85 },
    hatchback: { halfWidth: 0.48, halfLength: 0.85 },
    taxi: { halfWidth: 0.48, halfLength: 0.85 },
    bus: { halfWidth: 0.55, halfLength: 1.60 },
    delivery: { halfWidth: 0.49, halfLength: 1.12 },
    ambulance: { halfWidth: 0.49, halfLength: 1.12 },
    firetruck: { halfWidth: 0.55, halfLength: 1.40 },
    police: { halfWidth: 0.48, halfLength: 0.85 },
    utility: { halfWidth: 0.49, halfLength: 1.12 },
};

let traffic: TrafficSnapshot[] = [];

export function updateTrafficSnapshots(
    snapshots: TrafficSnapshot[]
): void {
    traffic = snapshots;
}

export function getTrafficSnapshots(): readonly TrafficSnapshot[] {
    return traffic;
}

export function clearTrafficSnapshots(): void {
    traffic = [];
}

export function vehicleRadius(kind: VehicleKind): number {
    const body = DIMENSIONS[kind];

    return Math.hypot(body.halfWidth, body.halfLength);
}

/**
 * Circle-versus-oriented-box collision.
 * The vehicle's front points along local +Z.
 */
export function circleHitsVehicle(
    point: Point,
    radius: number,
    vehicle: TrafficSnapshot,
    padding = 0
): boolean {
    const dx = point.x - vehicle.x;
    const dz = point.z - vehicle.z;

    const cos = Math.cos(vehicle.yaw);
    const sin = Math.sin(vehicle.yaw);

    // Transform the point into the vehicle's local frame.
    const localX = dx * cos - dz * sin;
    const localZ = dx * sin + dz * cos;

    const dimensions = DIMENSIONS[vehicle.kind];

    const halfWidth = dimensions.halfWidth + padding;
    const halfLength = dimensions.halfLength + padding;

    const nearestX = Math.max(
        -halfWidth,
        Math.min(halfWidth, localX)
    );

    const nearestZ = Math.max(
        -halfLength,
        Math.min(halfLength, localZ)
    );

    return (
        Math.hypot(
            localX - nearestX,
            localZ - nearestZ
        ) <= radius
    );
}

/**
 * Used by the player's ambulance.
 *
 * The radius approximates the ambulance body around
 * its center and includes a small safety margin.
 *
 * The optional starting point allows multiple checks
 * along one frame's movement, preventing tunneling.
 */
export function checkTrafficCollision(
    x: number,
    z: number,
    radius = 0.65,
    fromX = x,
    fromZ = z
): boolean {
    const safeRadius = Math.max(radius, 0.65);

    const length = Math.hypot(x - fromX, z - fromZ);
    const steps = Math.max(1, Math.ceil(length / 0.18));

    for (let step = 0; step <= steps; step++) {
        const t = step / steps;

        const point = {
            x: fromX + (x - fromX) * t,
            z: fromZ + (z - fromZ) * t,
        };

        for (const vehicle of traffic) {
            if (
                circleHitsVehicle(
                    point,
                    safeRadius,
                    vehicle,
                    0.08
                )
            ) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Predict whether one NPC vehicle would overlap
 * another vehicle at a proposed position.
 */
export function npcWouldCollide(
    candidate: TrafficSnapshot,
    others: readonly TrafficSnapshot[],
    extraGap = 0.12
): boolean {
    const radius = vehicleRadius(candidate.kind) + extraGap;

    for (const other of others) {
        if (other.id === candidate.id) continue;

        if (
            circleHitsVehicle(
                { x: candidate.x, z: candidate.z },
                radius,
                other
            )
        ) {
            return true;
        }
    }

    return false;
}
