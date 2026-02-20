import { ObjectId } from "mongodb";

class Profile {
  constructor(data) {
    this.name = data.name;
    this.timeAvailable = data.timeAvailable; // in hours
    this.energyLevel = data.energyLevel; // "Low" | "Medium" | "High"
    this.season = data.season; // "Winter" | "Spring" | "Summer" | "Fall"
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate a raw/sanitized profile object.
   * Returns an array of error messages (empty array = valid).
   */
  static validate(data) {
    const errors = [];

    // name: required, non-empty
    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required");
    }

    // timeAvailable: optional but if present must be a non-negative number
    if (data.timeAvailable !== undefined) {
      const t = Number(data.timeAvailable);
      if (!Number.isFinite(t) || t < 0) {
        errors.push("timeAvailable must be a non-negative number");
      }
    }

    // energyLevel: one of "Low" | "Medium" | "High"
    if (data.energyLevel) {
      const validEnergy = ["Low", "Medium", "High"];
      if (!validEnergy.includes(data.energyLevel)) {
        errors.push("energyLevel must be Low, Medium, or High");
      }
    } else {
      errors.push("energyLevel is required");
    }

    // season: one of "Winter" | "Spring" | "Summer" | "Fall"
    if (data.season) {
      const validSeasons = ["Winter", "Spring", "Summer", "Fall"];
      if (!validSeasons.includes(data.season)) {
        errors.push("season must be Winter, Spring, Summer, or Fall");
      }
    } else {
      errors.push("season is required");
    }

    return errors;
  }

  /**
   * Convert a raw incoming body to a clean internal representation
   * (types normalized, strings trimmed, safe defaults).
   */
  static sanitize(body) {
    return {
      name: body.name?.trim(),
      timeAvailable:
        body.timeAvailable !== undefined && body.timeAvailable !== null
          ? Number(body.timeAvailable)
          : 0,
      energyLevel: body.energyLevel,
      season: body.season,
      createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
      updatedAt: body.updatedAt ? new Date(body.updatedAt) : undefined,
    };
  }

  /**
   * Normalize Mongo document for sending back to the client.
   */
  static toOutput(profile) {
    return {
      ...profile,
      _id:
        profile._id instanceof ObjectId ? profile._id.toString() : profile._id,
    };
  }
}

export default Profile;
