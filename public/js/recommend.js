/* ------------- Utilities ------------- */

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(element, msg) {
  element.innerHTML = `
    <div class="alert alert-info">
      ${escapeHtml(msg)}
    </div>`;
}

async function apiGet(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

/* ------------- Handle Get Recommendation click ------------- */

async function handleGetRecommendationClick() {
  const selectEl = document.getElementById("profileSelect");
  const resultEl = document.getElementById("recommendationResult");

  if (!selectEl || !resultEl) return;

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
      showMessage(
        resultEl,
        "No recommendations found. Add projects or adjust your profile.",
      );
      return;
    }

    const topThree = recommendations.slice(0, 3);

    resultEl.innerHTML = `
      ${topThree
        .map((project, index) => {
          const title = escapeHtml(project.name ?? "Untitled");
          const score =
            project.score !== undefined && project.score !== null
              ? escapeHtml(String(project.score))
              : "";
          const reasons = Array.isArray(project.reasons) ? project.reasons : [];

          return `
            <div class="border rounded p-3 mb-3" style="background:#fff;">
              <div class="fw-semibold">#${index + 1} Recommendation</div>
              <div class="fs-5" style="margin-top:0.5rem;">${title}</div>
              ${
                score !== ""
                  ? `<div class="small text-muted">Score: ${score}</div>`
                  : ""
              }

              ${
                reasons.length > 0
                  ? `<div class="mt-2">
                       <div class="fw-semibold small">Why this one?</div>
                       <ul class="small mb-0">
                         ${reasons
                           .map((r) => `<li>${escapeHtml(r)}</li>`)
                           .join("")}
                       </ul>
                     </div>`
                  : `<div class="small text-muted mt-2">No explanation provided.</div>`
              }
            </div>
          `;
        })
        .join("")}
    `;
  } catch (err) {
    console.error("Recommendation failed:", err);
    showMessage(
      resultEl,
      `Recommendation failed: ${escapeHtml(err.message || "Unknown error")}`,
    );
  }
}

/* ------------- Wire up button ------------- */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("getRecommendationBtn");
  if (btn) {
    btn.addEventListener("click", handleGetRecommendationClick);
  }
});
