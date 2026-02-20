import express from "express";
import {
  getAllProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// GET /api/profiles
router.get("/", getAllProfiles);

// POST /api/profiles
router.post("/", createProfile);

// patch /api/profiles/:id
router.patch("/:id", updateProfile);

// DELETE /api/profiles/:id
router.delete("/:id", deleteProfile);

export default router;
