import dotenv from "dotenv";
import { connectDB, closeDB } from "./config/database.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

/* Start Server (local dev / production on Render/Railway etc.) */
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

/* Shutdown */
process.on("SIGINT", async () => {
  console.log("\nShutting down");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down");
  await closeDB();
  process.exit(0);
});

startServer();
