import dotenv from "dotenv";
import app from "../server/app.js";
import { connectDB } from "../server/config/database.js";

dotenv.config();

// Cache the connection promise across invocations
let dbReadyPromise = null;
function ensureDb() {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDB();
  }
  return dbReadyPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDb(); // make sure Mongo is connected
    return app(req, res); // let Express handle the routing
  } catch (err) {
    console.error("Error in Vercel handler:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
