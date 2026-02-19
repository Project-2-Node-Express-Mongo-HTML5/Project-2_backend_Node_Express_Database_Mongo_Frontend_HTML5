import dotenv from "dotenv";
import { connectDB, closeDB, getDB } from "./config/database.js";

dotenv.config();

// Template data for randomization
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
  "Tutorial",
  "Documentation",
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
  "Social Network",
  "Game Engine",
  "Music Player",
  "Fitness Tracker",
  "Recipe Book",
  "Budget Planner",
  "Note Taking App",
  "Calendar System",
  "File Manager",
  "Code Editor",
  "Payment Gateway",
  "home Automation",
  "gardening Planner",
  "crochet Tracker",
  "crafts Organizer",
  "cooking Assistant",
  "reading List",
  "baby hats",
  "scarves",
  "blankets",
  "soup recipes",
  "healthy meals",
  "fiction books",
  "non-fiction books",
  "self-help books",
  "painting project",
  "gardening project",

];

const descriptions = [
  "A comprehensive project to improve my skills",
  "Building this will help me understand core concepts",
  "An important step in my learning journey",
  "This project will showcase my abilities",
  "A practical application of recent learnings",
  "Implementing best practices and design patterns",
  "Exploring new technologies and frameworks",
  "A challenging project that will push my limits",
  "Creating something useful for daily tasks",
  "Experimenting with modern development tools",
  "A fun side project to keep my skills sharp",
  "A project to contribute to the open source community",
  "Building a portfolio piece to demonstrate my expertise",
  "A project that combines multiple areas of interest",
  "An opportunity to learn by doing and iterating",
  "A project that will help me solve a real-world problem",
  "A creative endeavor to express my ideas",
  "A project that will enhance my resume",
  "An ambitious project to challenge myself",
];

const tags = [
  "coding",
  "learning",
  "practice",
  "career",
  "personal",
  "professional",
  "web development",
  "mobile",
  "backend",
  "frontend",
  "fullstack",
  "devops",
  "algorithms",
  "data structures",
  "design",
  "ui/ux",
  "testing",
  "security",
  "performance",
  "optimization",
  "documentation",
  "tutorial",
  "hobby",
  "health",
  "productivity",
  "organization",
  "creative",
  "business",
  "fun",
  "crochet",
  "gardening",
  "home improvement",
  "crafts",
  "cooking",
  "reading",
];

const seasons = ["spring", "summer", "fall", "winter"];

const effortLevels = ["low", "medium", "high"];

const statuses = ["active", "completed", "abandoned", "archived"];

// Helper function to get random item from array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number in range
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random date in past year
function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date;
}

// Helper function to get random subset of array
function randomSubset(array, minCount = 1, maxCount = 4) {
  const count = randomNumber(minCount, Math.min(maxCount, array.length));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate projects
function generateProjects(count) {
  const projects = [];

  for (let i = 0; i < count; i++) {
    const status = randomItem(statuses);
    const createdAt = randomDate(365);
    const effortLevel = randomItem(effortLevels);

    const project = {
      name: `${randomItem(projectNames)} ${randomItem(projectTopics)} ${i + 1}`,
      description: randomItem(descriptions),
      estimatedTimeMinutes: randomNumber(15, 480), // 15 min to 8 hours
      effortLevel: effortLevel,
      intrinsicPriority: randomNumber(1, 10),
      status: status,
      tags: randomSubset(tags, 1, 3),
      season: randomSubset(seasons, 1, 4),
      createdAt: createdAt,
    };

    // Add completion/abandon dates based on status
    if (status === "completed") {
      const completedAt = new Date(createdAt);
      completedAt.setDate(completedAt.getDate() + randomNumber(1, 30));
      project.completedAt = completedAt;
    } else if (status === "abandoned") {
      const abandonedAt = new Date(createdAt);
      abandonedAt.setDate(abandonedAt.getDate() + randomNumber(1, 60));
      project.abandonedAt = abandonedAt;
    }

    projects.push(project);
  }

  return projects;
}

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

    console.log("Inserting seed data (this may take a moment)...");
    const result = await projectsCollection.insertMany(seedProjects);

    console.log(`✅ Successfully seeded ${result.insertedCount} projects!`);

    // Show summary
    const activeCount = await projectsCollection.countDocuments({
      status: "active",
    });
    const completedCount = await projectsCollection.countDocuments({
      status: "completed",
    });
    const abandonedCount = await projectsCollection.countDocuments({
      status: "abandoned",
    });
    const archivedCount = await projectsCollection.countDocuments({
      status: "archived",
    });

    console.log("\n Database Summary:");
    console.log(`   Active: ${activeCount}`);
    console.log(`   Completed: ${completedCount}`);
    console.log(`   Abandoned: ${abandonedCount}`);
    console.log(`   Archived: ${archivedCount}`);
    console.log(`   Total: ${result.insertedCount}`);

    // Show effort level distribution
    const lowEffort = await projectsCollection.countDocuments({
      effortLevel: "low",
    });
    const mediumEffort = await projectsCollection.countDocuments({
      effortLevel: "medium",
    });
    const highEffort = await projectsCollection.countDocuments({
      effortLevel: "high",
    });

    console.log("\n Effort Level Distribution:");
    console.log(`   Low: ${lowEffort}`);
    console.log(`   Medium: ${mediumEffort}`);
    console.log(`   High: ${highEffort}`);

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
