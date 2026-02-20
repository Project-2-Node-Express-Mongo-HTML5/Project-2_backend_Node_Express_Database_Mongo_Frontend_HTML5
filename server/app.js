// server/app.js
import express from "express";
import cors from "cors";

import projectRoutes from "./routes/projects.js";
import profileRoutes from "./routes/profiles.js";
import recommendRoutes from "./routes/recommend.js";

const app = express();

/* Middleware */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

// Serve static frontend files
app.use(express.static("public"));

/* Routes */
// Avery's Project Lifecycle Engine
app.use("/api/projects", projectRoutes);

// David's Decision Context Engine
app.use("/api/profiles", profileRoutes);

// Integrated Recommendation Engine
app.use("/api/recommend", recommendRoutes);

/* Health Check */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
  });
});

/* 404 Handler */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* Error Handling Middleware */
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;