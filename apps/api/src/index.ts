
import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incidents.js";
import "dotenv/config";
import { requireOperator } from "./middleware/requireOperator.js";
import demoRoutes from "./routes/demo.js";

const app = express();

const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
    res.json({ message: "NEXUS API is running!" });
});

app.use("/api/demo", demoRoutes);
app.use("/api/incidents", requireOperator, incidentRoutes);

app.listen(5000, () => {
    console.log("NEXUS API running on http://localhost:5000");
});
