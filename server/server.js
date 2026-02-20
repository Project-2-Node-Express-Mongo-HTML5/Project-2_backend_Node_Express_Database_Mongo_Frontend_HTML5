import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB, closeDB } from "./config/database.js";

import projectRoutes from "./routes/projects.js";
import profilesRoutes from "./routes/profiles.js";
import recommendRoutes from "./routes/recommend.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/*

  Middleware
*/

// Enable CORS (safe for development)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

// Parse JSON bodies
app.use(express.json());

// Serve static frontend files
app.use(express.static("public"));

/*
  Routes
  
*/

// Avery's Project Lifecycle Engine
app.use("/api/projects", projectRoutes);

// David's Decision Context Engine
app.use("/api/profiles", profilesRoutes);

// Integrated Recommendation Engine
app.use("/api/recommend", recommendRoutes);

/*
  Health Check
*/

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
  });
});

/*
  404 Handler
*/

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/*
Error Handling Middleware
*/

app.use((err, req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/*
=  Start Server
*/

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Frontend available at http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

/*
  Graceful Shutdown
*/

process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await closeDB();
  process.exit(0);
});

startServer();
