/* 
   Utility
 */

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* 
   API Helpers
*/

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
  return res.json();
}

async function apiPost(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`POST ${url} failed (${res.status})`);
  return res.json();
}

/* 
   Load Profiles
 */

export async function loadProfiles() {
  const selectEl = document.getElementById("profileSelect");

  selectEl.innerHTML = `<option value="">Loading profiles...</option>`;

  try {
    const profiles = await apiGet("/profiles");

    if (!profiles.length) {
      selectEl.innerHTML = `<option value="">No profiles yet</option>`;
      return;
    }

    selectEl.innerHTML =
      `<option value="">Select Profile</option>` +
      profiles
        .map(
          (profile) =>
            `<option value="${profile._id}">
              ${escapeHtml(profile.name)}
            </option>`,
        )
        .join("");
  } catch (error) {
    selectEl.innerHTML = `<option value="">Error loading profiles</option>`;
    console.error(error);
  }
}

/* 
   Handle Profile Creation
 */

export async function handleProfileSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    name: formData.get("name"),
    timeAvailable: Number(formData.get("timeAvailable") || 0),
    energyLevel: formData.get("energyLevel"),
    season: formData.get("season"),
  };
  /// Validate input and ensure name is not empty
  if (!payload.name || payload.name.trim().length === 0) {
    alert("Please enter a profile name.");
    return;
  }

  try {
    await apiPost("/profiles", payload);
    form.reset();
    await loadProfiles(); // Refresh the profile list
  } catch (error) {
    alert("Failed to save profile.");
    console.error(error);
  }
}
