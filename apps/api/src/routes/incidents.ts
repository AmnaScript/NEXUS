
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";

const router = Router();

const severities = ["High", "Medium", "Low"] as const;
const statuses = ["New", "Under Review", "Resolved"] as const;

type Severity = (typeof severities)[number];
type Status = (typeof statuses)[number];

function isSeverity(value: unknown): value is Severity {
    return severities.includes(value as Severity);
}

function isStatus(value: unknown): value is Status {
    return statuses.includes(value as Status);
}

// Convert Prisma record into frontend format
function formatIncident(incident: {
    id: string;
    reference: string;
    title: string;
    location: string;
    severity: string;
    status: string;
    longitude: number;
    latitude: number;
    createdAt: Date;
}) {
    return {
        id: incident.reference,
        title: incident.title,
        location: incident.location,
        severity: incident.severity,
        status: incident.status,
        coordinates: [incident.longitude, incident.latitude],
        createdAt: incident.createdAt.toISOString(),
    };
}

// GET all incidents
router.get("/", async (_req, res) => {
    try {
        const incidents = await prisma.incident.findMany({
            orderBy: { createdAt: "desc" },
        });

        return res.json(incidents.map(formatIncident));
    } catch (error) {
        console.error("Fetch incidents failed:", error);

        return res.status(500).json({
            message: "Unable to fetch incidents",
        });
    }
});

// POST create incident
router.post("/", async (req, res) => {
    const { title, location, severity, coordinates } = req.body ?? {};

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof location !== "string" ||
        !location.trim() ||
        !isSeverity(severity) ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        !coordinates.every(
            (value: unknown) =>
                typeof value === "number" && Number.isFinite(value)
        ) ||
        coordinates[0] < -180 ||
        coordinates[0] > 180 ||
        coordinates[1] < -90 ||
        coordinates[1] > 90
    ) {
        return res.status(400).json({
            message: "Invalid incident data",
        });
    }

    try {
        // Unique public reference; UUID remains internal DB ID
        const reference = `NX-${randomUUID().slice(0, 8).toUpperCase()}`;

        const incident = await prisma.incident.create({
            data: {
                reference,
                title: title.trim(),
                location: location.trim(),
                severity,
                status: "New",
                longitude: coordinates[0],
                latitude: coordinates[1],
                activities: {
                    create: {
                        action: "CREATED",
                        newStatus: "New",
                    },
                },
            },
        });

        return res.status(201).json(formatIncident(incident));
    } catch (error) {
        console.error("Create incident failed:", error);

        return res.status(500).json({
            message: "Unable to create incident",
        });
    }
});

// PATCH change incident status
router.patch("/:id/status", async (req, res) => {
    const reference = req.params.id;
    const { status } = req.body ?? {};

    if (!isStatus(status)) {
        return res.status(400).json({
            message: "Invalid incident status",
        });
    }

    try {
        const existing = await prisma.incident.findUnique({
            where: { reference },
        });

        if (!existing) {
            return res.status(404).json({
                message: "Incident not found",
            });
        }

        if (existing.status === status) {
            return res.json(formatIncident(existing));
        }

        const updated = await prisma.$transaction(async (tx) => {
            const incident = await tx.incident.update({
                where: { id: existing.id },
                data: { status },
            });

            await tx.incidentActivity.create({
                data: {
                    incidentId: existing.id,
                    action: "STATUS_CHANGED",
                    oldStatus: existing.status,
                    newStatus: status,
                },
            });

            return incident;
        });

        return res.json(formatIncident(updated));
    } catch (error) {
        console.error("Update status failed:", error);

        return res.status(500).json({
            message: "Unable to update incident status",
        });
    }
});

// GET activity history for an incident
router.get("/:id/activities", async (req, res) => {
    try {
        const incident = await prisma.incident.findUnique({
            where: { reference: req.params.id },
            select: { id: true },
        });

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found",
            });
        }

        const activities = await prisma.incidentActivity.findMany({
            where: { incidentId: incident.id },
            orderBy: { createdAt: "asc" },
        });

        return res.json(activities);
    } catch (error) {
        console.error("Fetch activities failed:", error);

        return res.status(500).json({
            message: "Unable to fetch incident activity",
        });
    }
});

export default router;
