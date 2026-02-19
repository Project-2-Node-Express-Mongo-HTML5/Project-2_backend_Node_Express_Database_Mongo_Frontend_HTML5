import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connector.js";

const router = express.Router();

/**
 * GET /recommend?profileId=...
 * This reads profiles collection and projects collection (ProjectManager.projects)
 */
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { profileId } = req.query;

    if (!profileId || !ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: "Invalid profileId" });
    }

    // Load selected profile
    const profile = await db
      .collection("profiles")
      .findOne({ _id: new ObjectId(profileId) });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const timeAvailable = Number(profile.timeAvailable || 0);
    const energyLevel = profile.energyLevel;
    const season = profile.season;

    // Load projects
    const projects = await db
      .collection("projects")
      .find({ status: "Planned" })
      .toArray();

    //  Score projects against profile
    const scored = projects.map((project) => {
      let score = 0;
      const reasons = [];

      const est = Number(project.estimatedTime || 0);
      const effort = project.effortLevel;
      const projectSeason = project.season;
      const priority = Number(project.intrinsicPriority || 0);

      // Time fit
      if (est <= timeAvailable) {
        score += 3;
        reasons.push(`Fits time: ${est}h ≤ ${timeAvailable}h`);
      } else {
        score -= 1;
        reasons.push(`Too long: ${est}h > ${timeAvailable}h`);
      }

      // Energy match
      if (effort === energyLevel) {
        score += 2;
        reasons.push(`Energy match: ${effort}`);
      } else {
        score -= 0.5;
        reasons.push(
          `Energy mismatch: project ${effort}, profile ${energyLevel}`,
        );
      }

      // Season match
      if (projectSeason === season) {
        score += 1;
        reasons.push(`Season match: ${season}`);
      }

      // Intrinsic priority boost
      score += priority;
      reasons.push(`Priority boost: +${priority}`);

      return {
        _id: project._id,
        title: project.title,
        estimatedTime: project.estimatedTime,
        effortLevel: project.effortLevel,
        intrinsicPriority: project.intrinsicPriority,
        season: project.season,
        status: project.status,
        createdAt: project.createdAt,
        score: Number(score.toFixed(2)),
        reasons,
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (err) {
    console.error("GET /recommend error:", err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});

export default router;
