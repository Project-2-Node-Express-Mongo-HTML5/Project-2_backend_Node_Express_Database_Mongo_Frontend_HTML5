import { MongoClient } from "mongodb";

let client;
let db;

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    if (db) {
      return db; // Prevent reconnecting
    }

    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const dbName = process.env.DB_NAME || "WeekendProjectManager";

    if (!uri) {
      throw new Error("MONGODB_URI not defined in environment variables");
    }

    client = new MongoClient(uri);

    await client.connect();

    db = client.db(dbName);

    console.log(` MongoDB connected successfully`);
    console.log(`Using database: ${dbName}`);

    await createIndexes();

    return db;
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Create indexes for performance
 */
const createIndexes = async () => {
  try {
    const projectsCollection = db.collection("projects");

    await projectsCollection.createIndex({ status: 1 });
    await projectsCollection.createIndex({ intrinsicPriority: -1 });
    await projectsCollection.createIndex({ createdAt: -1 });
    await projectsCollection.createIndex({ completedAt: -1 });

    console.log(" Database indexes created successfully");
  } catch (error) {
    console.error(" Error creating indexes:", error);
  }
};

/**
 * Get database instance
 */
const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
};

/**
 * Close database connection
 */
const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log("🔌 MongoDB connection closed");
    }
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};

export { connectDB, getDB, closeDB };
