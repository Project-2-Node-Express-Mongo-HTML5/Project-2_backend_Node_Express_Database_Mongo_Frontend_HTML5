import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import Profile from "../models/Profile.js";
import Project from "../models/Project.js";

const getProfilesCollection = () => getDB().collection("profiles");
const getProjectsCollection = () => getDB().collection("projects");

/**
 * GET /api/recommend?profileId=...
 */
export const recommendProjects = async (req, res) => {
  try {
    const { profileId } = req.query;

    if (!profileId || !ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: "Invalid profileId" });
    }

    // Load selected profile
    const profileDoc = await getProfilesCollection().findOne({
      _id: new ObjectId(profileId),
    });

    if (!profileDoc) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile = Profile.toOutput(profileDoc);

    const timeAvailable = Number(profileDoc.timeAvailable || 0); // hours
    const energyLevel = String(profileDoc.energyLevel || "").toLowerCase();
    const season = String(profileDoc.season || "").toLowerCase();

    // Load active projects
    const projectDocs = await getProjectsCollection()
      .find({ status: "active" })
      .toArray();

    if (projectDocs.length === 0) {
      return res.json([]);
    }

    // Score each project
    const scoredProjects = projectDocs.map((doc) => {
      const project = Project.toOutput(doc);

      let score = 0;
      const reasons = [];

      const estimatedMinutes = Number(doc.estimatedTimeMinutes || 0);
      const effort = String(doc.effortLevel || "").toLowerCase();
      const seasons = Array.isArray(doc.season) ? doc.season : [];
      const priority = Number(doc.intrinsicPriority || 0);

      // --- Time Fit ---
      if (timeAvailable > 0) {
        const availableMinutes = timeAvailable * 60;
        if (estimatedMinutes <= availableMinutes) {
          score += 3;
          reasons.push(
            `Time fit: ${estimatedMinutes} min ≤ ${availableMinutes} min available`,
          );
        } else {
          score -= 1;
          reasons.push(
            `Too long: ${estimatedMinutes} min > ${availableMinutes} min available`,
          );
        }
      } else {
        reasons.push("No time constraint specified");
      }

      // --- Energy Match ---
      if (energyLevel && effort) {
        if (energyLevel === effort) {
          score += 2;
          reasons.push(`Energy match: ${effort}`);
        } else {
          score -= 0.5;
          reasons.push(
            `Energy mismatch: project ${effort}, profile ${energyLevel}`,
          );
        }
      }

      // --- Season Match ---
      if (season && seasons.length > 0) {
        const normalizedSeasons = seasons.map((s) => String(s).toLowerCase());
        if (normalizedSeasons.includes(season)) {
          score += 1;
          reasons.push(`Season match: ${season}`);
        }
      }

      // --- Priority Boost ---
      if (Number.isFinite(priority)) {
        score += priority;
        reasons.push(`Priority boost: +${priority}`);
      }

      return {
        ...project,
        score: Number(score.toFixed(2)),
        reasons,
      };
    });

    // Sort highest score first
    scoredProjects.sort((a, b) => b.score - a.score);

    return res.json(scoredProjects);
  } catch (error) {
    console.error("Error in recommendProjects:", error);
    return res.status(500).json({ error: "Recommendation failed" });
  }
};
