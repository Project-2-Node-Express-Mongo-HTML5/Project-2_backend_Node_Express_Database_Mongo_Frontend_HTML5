// import { MongoClient } from "mongodb";

// function MyMongoDB({
//   dbName = "apartmentFinder",
//   collectionName = "listings",
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
