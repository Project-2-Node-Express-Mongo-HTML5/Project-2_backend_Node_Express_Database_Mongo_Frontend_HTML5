import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const router = express.Router();

/*
  GET /api/profiles
  List all profiles
*/
router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const profiles = await db
      .collection("profiles")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(profiles);
  } catch (err) {
    console.error("GET /api/profiles error:", err);
    res.status(500).json({ error: "Failed to load profiles" });
  }
});

/*
  GET /api/profiles/:id
  Get single profile
*/
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid profile id" });
    }

    const profile = await db
      .collection("profiles")
      .findOne({ _id: new ObjectId(id) });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("GET /api/profiles/:id error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

/*
  POST /api/profiles
  Create new profile
*/
router.post("/", async (req, res) => {
  try {
    const db = getDB();

    const name = (req.body.name || "").trim();
    const timeAvailable = Number(req.body.timeAvailable || 0); // hours
    const energyLevel = req.body.energyLevel;
    const season = req.body.season;

    // Validation
    if (!name) {
      return res.status(400).json({ error: "Profile name is required" });
    }

    const validEnergy = ["Low", "Medium", "High"];
    const validSeasons = ["Winter", "Spring", "Summer", "Fall"];

    if (!validEnergy.includes(energyLevel)) {
      return res.status(400).json({ error: "Invalid energyLevel" });
    }

    if (!validSeasons.includes(season)) {
      return res.status(400).json({ error: "Invalid season" });
    }

    if (!Number.isFinite(timeAvailable) || timeAvailable < 0) {
      return res
        .status(400)
        .json({ error: "Invalid timeAvailable (must be ≥ 0 hours)" });
    }

    const now = new Date();

    const newProfile = {
      name,
      timeAvailable,
      energyLevel,
      season,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("profiles").insertOne(newProfile);

    res.status(201).json({
      ...newProfile,
      _id: result.insertedId,
    });
  } catch (err) {
    console.error("POST /api/profiles error:", err);
    res.status(500).json({ error: "Failed to create profile" });
  }
});

/*
  PATCH /api/profiles/:id
  Update profile
*/
router.patch("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid profile id" });
    }

    const updates = {};

    if (req.body.name !== undefined)
      updates.name = String(req.body.name).trim();

    if (req.body.timeAvailable !== undefined)
      updates.timeAvailable = Number(req.body.timeAvailable);

    if (req.body.energyLevel !== undefined)
      updates.energyLevel = req.body.energyLevel;

    if (req.body.season !== undefined) updates.season = req.body.season;

    // Basic validation
    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    if (updates.timeAvailable !== undefined) {
      if (
        !Number.isFinite(updates.timeAvailable) ||
        updates.timeAvailable < 0
      ) {
        return res.status(400).json({ error: "Invalid timeAvailable" });
      }
    }

    if (updates.energyLevel !== undefined) {
      const validEnergy = ["Low", "Medium", "High"];
      if (!validEnergy.includes(updates.energyLevel)) {
        return res.status(400).json({ error: "Invalid energyLevel" });
      }
    }

    if (updates.season !== undefined) {
      const validSeasons = ["Winter", "Spring", "Summer", "Fall"];
      if (!validSeasons.includes(updates.season)) {
        return res.status(400).json({ error: "Invalid season" });
      }
    }

    updates.updatedAt = new Date();

    const result = await db
      .collection("profiles")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" },
      );

    if (!result.value) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error("PATCH /api/profiles/:id error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/*
  ===============================
  DELETE /api/profiles/:id
  ===============================
*/
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid profile id" });
    }

    const result = await db
      .collection("profiles")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/profiles/:id error:", err);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

export default router;
