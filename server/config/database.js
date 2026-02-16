const { MongoClient } = require('mongodb');

let client;
let db;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    db = client.db(process.env.DB_NAME);
    
    console.log('MongoDB connected successfully');
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const projectsCollection = db.collection('projects');
    
    // Index for status filtering
    await projectsCollection.createIndex({ status: 1 });
    
    // Index for priority sorting
    await projectsCollection.createIndex({ intrinsicPriority: -1 });
    
    // Index for date sorting
    await projectsCollection.createIndex({ createdAt: -1 });
    
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };