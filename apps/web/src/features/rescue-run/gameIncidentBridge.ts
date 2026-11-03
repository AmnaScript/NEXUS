
import type { Incident } from "../incidents/incidents";
import type { Position2 } from "./gameConfig";

const STORAGE_KEY = "nexus-rescue-demo-incidents-v1";
const MAX_RECORDS = 30;

// Fictional projection into a small area around the demo map center.
// These coordinates are NOT real emergency locations.
const DEMO_CENTER = {
    longitude: 73.0479,
    latitude: 33.6844,
};

function toMapCoordinates(point: Position2): [number, number] {
    return [
        DEMO_CENTER.longitude + point.x * 0.00022,
        DEMO_CENTER.latitude - point.z * 0.00022,
    ];
}

function readAll(): Incident[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter((item): item is Incident => {
            if (typeof item !== "object" || item === null) {
                return false;
            }

            const record = item as Partial<Incident>;

            return (
                typeof record.id === "string" &&
                record.id.startsWith("GAME-") &&
                typeof record.title === "string" &&
                typeof record.location === "string" &&
                (record.severity === "High" ||
                    record.severity === "Medium" ||
                    record.severity === "Low") &&
                (record.status === "New" ||
                    record.status === "Under Review" ||
                    record.status === "Resolved") &&
                Array.isArray(record.coordinates) &&
                record.coordinates.length === 2 &&
                record.coordinates.every(
                    (value) =>
                        typeof value === "number" &&
                        Number.isFinite(value)
                ) &&
                typeof record.createdAt === "string"
            );
        });
    } catch {
        return [];
    }
}

function writeAll(records: Incident[]): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(records.slice(0, MAX_RECORDS))
        );

        window.dispatchEvent(
            new CustomEvent("nexus:game-incidents-updated")
        );
    } catch {
        // The game remains playable if storage is unavailable.
    }
}

export function getLocalGameIncidents(): Incident[] {
    return readAll();
}

export function clearLocalGameIncidents(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(
            new CustomEvent("nexus:game-incidents-updated")
        );
    } catch {
        // Storage may be disabled.
    }
}

export function createGameIncident(
    runId: string,
    missionNumber: number,
    location: Position2
): string {
    const id = `GAME-${runId}-${missionNumber}`;

    const incident: Incident = {
        id,
        title: `Rescue Run — Patient ${missionNumber}`,
        location: `Rescue Run / District 01 / Mission ${missionNumber}`,
        severity: missionNumber >= 3 ? "High" : "Medium",
        status: "New",
        coordinates: toMapCoordinates(location),
        createdAt: new Date().toISOString(),
    };

    const records = readAll().filter(
        (item) => item.id !== id
    );

    writeAll([incident, ...records]);

    return id;
}

export function updateGameIncident(
    id: string,
    status: Incident["status"]
): void {
    if (!id.startsWith("GAME-")) return;

    const records = readAll();
    const existing = records.find((item) => item.id === id);

    if (!existing || existing.status === status) return;

    writeAll(
        records.map((item) =>
            item.id === id ? { ...item, status } : item
        )
    );
}

export function abandonGameIncident(id: string): void {
    if (!id.startsWith("GAME-")) return;

    // Keep the incident but don't falsely claim it was resolved.
    // Unfinished missions remain New or Under Review.
}
