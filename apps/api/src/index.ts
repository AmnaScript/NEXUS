
import "dotenv/config";
import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";

import incidentRoutes from "./routes/incidents.js";
import demoRoutes from "./routes/demo.js";
import { prisma } from "./lib/prisma.js";
import { createOperatorModule } from "./modules/operators/operatorModule.js";

const app = express();

const operatorModule = createOperatorModule(prisma);

const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
    res.json({ message: "NEXUS API is running!" });
});

// Deeper check: confirms the database is reachable and the operator tables exist.
app.get("/api/health/db", async (_req, res) => {
    try {
        await prisma.operatorAccount.count();
        await prisma.incident.count();
        res.json({ database: "ok" });
    } catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({
            database: "unavailable",
            hint: "Run apps/api/prisma/sql/001_operator_tables.sql in Supabase",
        });
    }
});

app.use("/api/demo", demoRoutes);
app.use("/api/operator", operatorModule.router);

app.use(
    "/api/incidents",
    operatorModule.requireOperator,
    incidentRoutes
);

// Always answer with JSON so the web app can tell "server problem" from "access denied".
const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    console.error("Unhandled API error:", error);
    res.status(500).json({
        error: "Server error. Please try again shortly.",
        message: "Server error. Please try again shortly.",
    });
};

app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
    const PORT = Number(process.env.PORT || 5000);

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`NEXUS API running on port ${PORT}`);
    });
}
