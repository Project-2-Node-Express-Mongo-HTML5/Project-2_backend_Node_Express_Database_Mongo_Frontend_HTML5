class Project {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || "";
    this.estimatedTimeMinutes = data.estimatedTimeMinutes;
    this.effortLevel = data.effortLevel;
    this.intrinsicPriority = data.intrinsicPriority;
    this.status = data.status || "active";
    this.tags = data.tags || [];
    this.season = data.season || [];
    this.createdAt = data.createdAt || new Date();
    this.completedAt = data.completedAt || null;
    this.abandonedAt = data.abandonedAt || null;
  }

  /* 
     VALIDATION
    */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required");
    }

    if (!data.estimatedTimeMinutes || data.estimatedTimeMinutes < 1) {
      errors.push("Estimated time must be at least 1 minute");
    }

    if (!["low", "medium", "high"].includes(data.effortLevel)) {
      errors.push("Effort level must be low, medium, or high");
    }

    if (
      !data.intrinsicPriority ||
      data.intrinsicPriority < 1 ||
      data.intrinsicPriority > 10
    ) {
      errors.push("Priority must be between 1 and 10");
    }

    if (
      data.status &&
      !["active", "completed", "abandoned", "archived"].includes(data.status)
    ) {
      errors.push("Invalid status");
    }

    if (data.season && Array.isArray(data.season)) {
      const validSeasons = ["spring", "summer", "fall", "winter"];
      const invalidSeasons = data.season.filter(
        (s) => !validSeasons.includes(s),
      );
      if (invalidSeasons.length > 0) {
        errors.push("Invalid season values");
      }
    }

    return errors;
  }

  /* 
     SANITIZE INPUT
 */
  static sanitize(data) {
    return {
      name: data.name?.trim(),
      description: data.description?.trim() || "",
      estimatedTimeMinutes: parseInt(data.estimatedTimeMinutes),
      effortLevel: data.effortLevel,
      intrinsicPriority: parseInt(data.intrinsicPriority),
      status: data.status || "active",
      tags: Array.isArray(data.tags)
        ? data.tags.map((t) => t.trim()).filter((t) => t)
        : [],
      season: Array.isArray(data.season) ? data.season : [],
    };
  }

  /* 
     FORMAT OUTPUT FOR FRONTEND
     */
  static toOutput(project) {
    return {
      ...project,
      _id: project._id.toString(),
      estimatedTimeHours: (project.estimatedTimeMinutes / 60).toFixed(1),
    };
  }
}

export default Project;
