// server/routes/recommend.js
import express from "express";
import { recommendProjects } from "../controllers/recommendController.js";

const router = express.Router();

// GET /api/recommend?profileId=...
router.get("/", recommendProjects);

export default router;
