
import { Router } from "express";

const router = Router();

const demoIncidents = [
    {
        id: "NX-DEMO-001",
        title: "Road obstruction",
        location: "Central Avenue",
        severity: "High",
        status: "Under Review",
        coordinates: [73.0479, 33.6844],
        createdAt: "2026-10-30T09:00:00.000Z",
    },
    {
        id: "NX-DEMO-002",
        title: "Water pipeline leakage",
        location: "West District",
        severity: "Medium",
        status: "New",
        coordinates: [73.0395, 33.6905],
        createdAt: "2026-10-30T09:15:00.000Z",
    },
    {
        id: "NX-DEMO-003",
        title: "Traffic signal failure",
        location: "North Junction",
        severity: "Low",
        status: "Resolved",
        coordinates: [73.0555, 33.6945],
        createdAt: "2026-10-30T08:30:00.000Z",
    },
];

router.get("/incidents", (_req, res) => {
    res.json(demoIncidents);
});

export default router;
