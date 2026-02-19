// import express from "express";
// import listingsRouter from "./routes/listings.js";

// console.log("Initializing the backend...");
// const PORT = process.env.PORT || 8080;

// const app = express();

// app.use(express.static("frontend"));

// app.use("/api/", listingsRouter);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

import express from "express";
import profilesRouter from "./routes/profiles.js";
import recommendRouter from "./routes/recommend.js";
import { connectDB } from "./db/connector.js";

console.log("Initializing the backend...");

const PORT = process.env.PORT || 8080;

const app = express();

/*
  Middleware
*/

// Parse JSON request bodies
app.use(express.json());

// Serve static frontend files
app.use(express.static("frontend"));

/*
  Routes
*/

app.use("/profiles", profilesRouter);
app.use("/recommend", recommendRouter);

/*
  Start Server 
*/

async function startServer() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
