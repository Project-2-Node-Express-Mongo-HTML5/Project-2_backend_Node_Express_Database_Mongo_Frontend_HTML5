import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const getProfilesCollection = () => getDB().collection("profiles");

function sanitizeProfile(data) {
  return {
    name: data.name?.trim() ?? "",
    timeAvailable: Number(data.timeAvailable ?? 0),
    energyLevel: data.energyLevel,
    season: data.season,
  };
}

function validateProfile(data) {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  }

  if (!data.energyLevel) {
    errors.push("Energy level is required");
  }

  if (!data.season) {
    errors.push("Season is required");
  }

  return errors;
}

export async function getAllProfiles(req, res) {
  try {
    const collection = getProfilesCollection();
    const profiles = await collection.find({}).sort({ name: 1 }).toArray();

    // convert _id to string so frontend sees it nicely
    const output = profiles.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    res.json(output);
  } catch (err) {
    console.error("Error getting profiles:", err);
    res.status(500).json({ error: "Failed to load profiles" });
  }
}

export async function createProfile(req, res) {
  try {
    const body = sanitizeProfile(req.body);
    const errors = validateProfile(body);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const collection = getProfilesCollection();
    const result = await collection.insertOne({
      ...body,
      createdAt: new Date(),
    });

    const inserted = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({
      ...inserted,
      _id: inserted._id.toString(),
    });
  } catch (err) {
    console.error("Error creating profile:", err);
    res.status(500).json({ error: "Failed to create profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;

    // Basic sanity check for id format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid profile id" });
    }

    const body = sanitizeProfile(req.body);
    const errors = validateProfile(body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const collection = getProfilesCollection();

    // 1) Try normal ObjectId-based lookup
    let result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: body },
      { returnDocument: "after" },
    );

    // In some driver versions, result can be:
    // - { value: <doc or null>, ok: 1, lastErrorObject: {...} }
    // - OR null (if no match)
    const foundDoc = result && result.value ? result.value : null;

    // 2) If no document found with ObjectId, try string _id fallback
    let finalDoc = foundDoc;
    if (!finalDoc) {
      const fallbackResult = await collection.findOneAndUpdate(
        { _id: id }, // string _id fallback
        { $set: body },
        { returnDocument: "after" },
      );

      finalDoc =
        fallbackResult && fallbackResult.value ? fallbackResult.value : null;
    }

    // 3) Still nothing? Then truly "not found"
    if (!finalDoc) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 4) Convert _id to string for the client
    res.json({
      ...finalDoc,
      _id: finalDoc._id.toString(),
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function deleteProfile(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid profile id" });
    }

    const collection = getProfilesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ message: "Profile deleted" });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ error: "Failed to delete profile" });
  }
}
