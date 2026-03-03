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
  console.log("PATCH response:", res);
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

// ---------- Rendering ----------

function renderProfilesDropdown() {
  const selectEl = document.getElementById("profileSelect");
  if (!selectEl) return;

  // No profiles: show friendly message
  if (!profilesCache.length) {
    selectEl.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No profiles yet";
    selectEl.appendChild(opt);
    return;
  }

  // Rebuild from cache
  selectEl.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select Profile";
  selectEl.appendChild(placeholder);

  profilesCache.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p._id;
    // textContent is safe; escapeHtml is not strictly necessary here,
    // but leaving it to avoid any weird characters
    opt.textContent = p.name ? escapeHtml(p.name) : "Untitled";
    selectEl.appendChild(opt);
  });
}

// ---------- Load Profiles ----------

async function loadProfiles() {
  const selectEl = document.getElementById("profileSelect");
  if (!selectEl) return;

  selectEl.innerHTML = "";
  const loading = document.createElement("option");
  loading.value = "";
  loading.textContent = "Loading profiles...";
  selectEl.appendChild(loading);

  try {
    const profiles = await apiGet("/profiles");
    profilesCache = Array.isArray(profiles) ? profiles : [];
    renderProfilesDropdown();
  } catch (err) {
    console.error("Failed to load profiles:", err);
    selectEl.innerHTML = "";
    const errorOpt = document.createElement("option");
    errorOpt.value = "";
    errorOpt.textContent = "Error loading profiles";
    selectEl.appendChild(errorOpt);
  }
}

// ---------- Fill Form ----------

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

// ---------- Handle Submit ----------

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
      // UPDATE existing profile
      saved = await apiPatch(
        `/profiles/${encodeURIComponent(editingProfileId)}`,
        payload,
      );

      // Update local cache entry
      profilesCache = profilesCache.map((p) =>
        p._id === saved._id ? saved : p,
      );
    } else {
      // CREATE new profile
      saved = await apiPost("/profiles", payload);
      profilesCache.push(saved);
    }

    // Re-render dropdown from updated cache
    renderProfilesDropdown();

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

    // Remove from cache and re-render
    profilesCache = profilesCache.filter((p) => p._id !== id);
    renderProfilesDropdown();
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
