// import { MongoClient } from "mongodb";

// function MyMongoDB({
//   dbName = "ProjectManager",
//   collectionName = "data",
//   defaultUri = "mongodb://localhost:27017",
// } = {}) {
//   const me = {};
//   const URI = process.env.MONGODB_URI || defaultUri;

//   const connect = () => {
//     console.log("Connecting to MongoDB at", URI);
//     const client = new MongoClient(URI);
//     const listings = client.db(dbName).collection(collectionName);

//     return { client, listings };
//   };

//   me.getListings = async ({ query = {}, pageSize = 20, page = 1 } = {}) => {
//     const { client, listings } = connect();

//     try {
//       const data = await listings
//         .find(query)
//         .limit(pageSize)
//         .skip(pageSize * (page - 1))
//         .toArray();
//       console.log("📈 Fetched listings from MongoDB", data.length);
//       return data;
//     } catch (err) {
//       console.error("Error fetching listings from MongoDB", err);
//       throw err;
//     } finally {
//       await client.close();
//     }
//   };

//   return me;
// }

// const myMongoDB = MyMongoDB();
// export default myMongoDB;

import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "ProjectManager";

let client;
let db;

export async function connectDB() {
  if (!client) {
    console.log("Connecting to MongoDB at", URI);
    client = new MongoClient(URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to database:", DB_NAME);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}
