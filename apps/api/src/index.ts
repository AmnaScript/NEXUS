
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import incidentRoutes from "./routes/incidents.js";
import demoRoutes from "./routes/demo.js";
import { createOperatorModule } from "./modules/operators/operatorModule.js";

const app = express();
const prisma = new PrismaClient();

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

app.use("/api/demo", demoRoutes);
app.use("/api/operator", operatorModule.router);

app.use(
    "/api/incidents",
    operatorModule.requireOperator,
    incidentRoutes
);

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`NEXUS API running on port ${PORT}`);
});
