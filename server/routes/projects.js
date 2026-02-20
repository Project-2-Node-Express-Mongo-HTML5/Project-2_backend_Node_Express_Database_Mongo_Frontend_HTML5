import express from "express";
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  completeProject,
  abandonProject,
  getProjectsByPriority,
  getStats,
} from "../controllers/projectController.js";

const router = express.Router();

// CRUD routes
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/priority", getProjectsByPriority);
router.get("/stats", getStats);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Status update routes
router.patch("/:id/complete", completeProject);
router.patch("/:id/abandon", abandonProject);

export default router;
