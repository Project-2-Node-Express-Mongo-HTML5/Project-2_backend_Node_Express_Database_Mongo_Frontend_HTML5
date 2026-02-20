import dotenv from "dotenv";
import { connectDB, closeDB, getDB } from "./config/database.js";

dotenv.config();

/*
  Random Data Templates
*/

const projectNames = [
  "Build",
  "Learn",
  "Practice",
  "Create",
  "Design",
  "Develop",
  "Master",
  "Study",
  "Read",
  "Write",
  "Organize",
  "Plan",
  "Implement",
  "Refactor",
  "Optimize",
  "Deploy",
  "Test",
  "Debug",
  "Research",
  "Explore",
  "Prototype",
  "Document",
];

const projectTopics = [
  "React App",
  "Python Script",
  "Data Structures",
  "Machine Learning Model",
  "REST API",
  "Mobile App",
  "Database Schema",
  "UI Component",
  "Algorithm",
  "Portfolio Site",
  "Blog Post",
  "Testing Suite",
  "CI/CD Pipeline",
  "Docker Container",
  "Microservice",
  "Authentication System",
  "Photo Gallery",
  "Task Manager",
  "Weather Dashboard",
  "Chat Application",
  "E-commerce Site",
  "Game Engine",
  "Music Player",
  "Fitness Tracker",
  "Budget Planner",
];

const descriptions = [
  "A comprehensive project to improve my skills",
  "Building this will help me understand core concepts",
  "An important step in my learning journey",
  "This project will showcase my abilities",
  "A practical application of recent learnings",
  "Exploring new technologies and frameworks",
  "A challenging project that will push my limits",
  "Creating something useful for daily tasks",
  "Experimenting with modern development tools",
];

const tags = [
  "coding",
  "learning",
  "practice",
  "career",
  "personal",
  "professional",
  "web development",
  "backend",
  "frontend",
  "fullstack",
  "devops",
  "algorithms",
  "design",
  "testing",
  "creative",
  "productivity",
];

const seasons = ["spring", "summer", "fall", "winter"];
const effortLevels = ["low", "medium", "high"];
const statuses = ["active", "completed", "abandoned", "archived"];

/*
  Utility Functions
*/

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date;
}

function randomSubset(array, minCount = 1, maxCount = 3) {
  const count = randomNumber(minCount, Math.min(maxCount, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/*
  Generate Projects
*/

function generateProjects(count) {
  const projects = [];

  for (let i = 0; i < count; i++) {
    const status = randomItem(statuses);
    const createdAt = randomDate(365);
    const effortLevel = randomItem(effortLevels);

    const project = {
      name: `${randomItem(projectNames)} ${randomItem(projectTopics)} ${i + 1}`,
      description: randomItem(descriptions),
      estimatedTimeMinutes: randomNumber(15, 480), // 15 min to 8 hrs
      effortLevel,
      intrinsicPriority: randomNumber(1, 10),
      status,
      tags: randomSubset(tags),
      season: randomSubset(seasons),
      createdAt,
    };

    if (status === "completed") {
      const completedAt = new Date(createdAt);
      completedAt.setDate(completedAt.getDate() + randomNumber(1, 30));
      project.completedAt = completedAt;
    }

    if (status === "abandoned") {
      const abandonedAt = new Date(createdAt);
      abandonedAt.setDate(abandonedAt.getDate() + randomNumber(1, 60));
      project.abandonedAt = abandonedAt;
    }

    projects.push(project);
  }

  return projects;
}

/*
  ===============================
  Seed Database
  ===============================
*/

async function seedDatabase() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    const db = getDB();
    const projectsCollection = db.collection("projects");

    console.log("Clearing existing projects...");
    await projectsCollection.deleteMany({});

    console.log("Generating 1000 test projects...");
    const seedProjects = generateProjects(1000);

    console.log("Inserting seed data...");
    const result = await projectsCollection.insertMany(seedProjects);

    console.log(`  seeded ${result.insertedCount} projects!`);

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
