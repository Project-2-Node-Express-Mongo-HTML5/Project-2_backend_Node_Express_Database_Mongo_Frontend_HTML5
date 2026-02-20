const API_BASE = "/api";

// ---------- Utilities ----------

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

async function apiPost(path, payload) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST ${path} failed (${res.status})`);
  return res.json();
}

async function apiPatch(path, payload) {
  const res = await fetch(API_BASE + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed (${res.status})`);
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed (${res.status})`);
  return res.json();
}

// ---------- State ----------

let profilesCache = [];
let editingProfileId = null;

// ---------- Load Profiles ----------

async function loadProfiles() {
  const selectEl = document.getElementById("profileSelect");
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="">Loading profiles...</option>`;

  try {
    const profiles = await apiGet("/profiles");
    profilesCache = Array.isArray(profiles) ? profiles : [];

    if (profilesCache.length === 0) {
      selectEl.innerHTML = `<option value="">No profiles yet</option>`;
      return;
    }

    selectEl.innerHTML =
      `<option value="">Select Profile</option>` +
      profilesCache
        .map(
          (p) => `
        <option value="${p._id}">
          ${escapeHtml(p.name ?? "Untitled")}
        </option>
      `,
        )
        .join("");
  } catch (err) {
    console.error("Failed to load profiles:", err);
    selectEl.innerHTML = `<option value="">Error loading profiles</option>`;
  }
}

// ---------- Fill Form (Edit Mode) ----------

function fillForm(profile) {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.elements.name.value = profile.name ?? "";
  form.elements.timeAvailable.value =
    profile.timeAvailable !== undefined ? String(profile.timeAvailable) : "";
  form.elements.energyLevel.value = profile.energyLevel ?? "";
  form.elements.season.value = profile.season ?? "";
}

// ---------- Reset Form ----------

function resetForm() {
  const form = document.getElementById("profileForm");
  if (form) form.reset();

  editingProfileId = null;

  const status = document.getElementById("profileEditStatus");
  if (status) status.textContent = "";

  const cancelBtn = document.getElementById("cancelEditProfileBtn");
  if (cancelBtn) cancelBtn.style.display = "none";
}

// ---------- Handle Submit (Create + Update) ----------

async function handleProfileSubmit(event) {
  event.preventDefault();

  const form = event.target;

  const payload = {
    name: form.elements.name.value,
    timeAvailable: Number(form.elements.timeAvailable.value || 0),
    energyLevel: form.elements.energyLevel.value,
    season: form.elements.season.value,
  };

  if (!payload.name.trim()) {
    alert("Profile name required.");
    return;
  }

  try {
    let saved;

    if (editingProfileId) {
      // UPDATE
      saved = await apiPatch(
        `/profiles/${encodeURIComponent(editingProfileId)}`,
        payload,
      );
    } else {
      // CREATE
      saved = await apiPost("/profiles", payload);
    }

    // 🔥 Refresh dropdown without page reload
    await loadProfiles();

    // Re-select saved profile
    const selectEl = document.getElementById("profileSelect");
    if (selectEl && saved && saved._id) {
      selectEl.value = saved._id;
    }

    resetForm();
  } catch (err) {
    console.error("Failed to save profile:", err);
    alert("Failed to save profile.");
  }
}

// ---------- Edit Selected Profile ----------

function handleEditSelected() {
  const selectEl = document.getElementById("profileSelect");
  if (!selectEl) return;

  const id = selectEl.value;
  if (!id) {
    alert("Select a profile first.");
    return;
  }

  const profile = profilesCache.find((p) => p._id === id);
  if (!profile) return;

  editingProfileId = id;
  fillForm(profile);

  const status = document.getElementById("profileEditStatus");
  if (status) {
    status.textContent = `Editing: ${profile.name}`;
  }

  const cancelBtn = document.getElementById("cancelEditProfileBtn");
  if (cancelBtn) cancelBtn.style.display = "inline-block";
}

// ---------- Delete Profile ----------

async function deleteSelectedProfile() {
  const selectEl = document.getElementById("profileSelect");
  if (!selectEl) return;

  const id = selectEl.value;
  if (!id) {
    alert("Select a profile first.");
    return;
  }

  if (!confirm("Delete this profile?")) return;

  try {
    await apiDelete(`/profiles/${encodeURIComponent(id)}`);
    await loadProfiles();
    resetForm();
  } catch (err) {
    console.error("Failed to delete profile:", err);
    alert("Failed to delete profile.");
  }
}

window.deleteSelectedProfile = deleteSelectedProfile;

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profileForm");
  if (form) {
    form.addEventListener("submit", handleProfileSubmit);
  }

  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", handleEditSelected);
  }

  const cancelBtn = document.getElementById("cancelEditProfileBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  loadProfiles();
});
