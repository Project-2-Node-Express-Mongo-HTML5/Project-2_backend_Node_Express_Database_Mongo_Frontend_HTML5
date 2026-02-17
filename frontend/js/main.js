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

function showMessage(element, msg) {
  element.innerHTML = `<div class="alert alert-info p-2 mb-0">${escapeHtml(msg)}</div>`;
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
   Profiles
 */

async function loadProfiles() {
  const selectEl = document.getElementById("profileSelect");
  selectEl.innerHTML = `<option value="">Loading profiles...</option>`;

  try {
    const profiles = await apiGet("/profiles");
    renderProfiles(profiles);
  } catch (err) {
    selectEl.innerHTML = `<option value="">(Error loading profiles)</option>`;
    console.error(err);
  }
}

function renderProfiles(profiles) {
  const selectEl = document.getElementById("profileSelect");

  if (!Array.isArray(profiles) || profiles.length === 0) {
    selectEl.innerHTML = `<option value="">No profiles yet</option>`;
    return;
  }

  selectEl.innerHTML =
    `<option value="">Select Profile</option>` +
    profiles
      .map((profile) => {
        return `<option value="${profile._id}">
                  ${escapeHtml(profile.name)}
                </option>`;
      })
      .join("");
}

async function handleProfileSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    name: formData.get("name"),
    timeAvailable: Number(formData.get("timeAvailable") || 0),
    energyLevel: formData.get("energyLevel"),
    season: formData.get("season"),
  };

  if (!payload.name || payload.name.trim().length === 0) {
    alert("Please enter a profile name.");
    return;
  }

  try {
    await apiPost("/profiles", payload);
    form.reset();
    await loadProfiles();
  } catch (err) {
    alert(`Failed to save profile: ${err.message}`);
  }
}

/* 
   Recommend
*/

async function handleRecommendClick() {
  const selectEl = document.getElementById("profileSelect");
  const resultEl = document.getElementById("recommendationResult");

  const profileId = selectEl.value;

  if (!profileId) {
    showMessage(resultEl, "Select a profile first.");
    return;
  }

  resultEl.innerHTML = `<div class="text-muted">Computing recommendation...</div>`;

  try {
    const recommendations = await apiGet(
      `/recommend?profileId=${encodeURIComponent(profileId)}`,
    );

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      showMessage(resultEl, "No recommendations found.");
      return;
    }

    const top = recommendations[0];

    resultEl.innerHTML = `
      <div class="border rounded p-2">
        <div class="fw-semibold">Recommended Next:</div>
        <div class="fs-5">${escapeHtml(top.title)}</div>
        ${
          top.score
            ? `<div class="small text-muted">Score: ${escapeHtml(top.score)}</div>`
            : ""
        }
        ${
          Array.isArray(top.reasons) && top.reasons.length > 0
            ? `<ul class="small mt-2 mb-0">
                 ${top.reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
               </ul>`
            : ""
        }
      </div>
    `;
  } catch (err) {
    showMessage(resultEl, `Recommendation failed: ${err.message}`);
  }
}

/* 
   Initialization
 */

function init() {
  const profileForm = document.getElementById("profileForm");
  const recommendBtn = document.getElementById("recommendBtn");

  if (profileForm) profileForm.addEventListener("submit", handleProfileSubmit);
  if (recommendBtn)
    recommendBtn.addEventListener("click", handleRecommendClick);

  loadProfiles();
}

document.addEventListener("DOMContentLoaded", init);
