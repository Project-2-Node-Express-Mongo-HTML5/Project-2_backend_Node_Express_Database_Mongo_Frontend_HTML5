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
  element.innerHTML = `
    <div class="alert alert-info p-2 mb-0">
      ${escapeHtml(msg)}
    </div>`;
}

/* 
   API Helper
 */

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
  return res.json();
}

/* 
   Recommend Handler 
 */

export async function handleRecommendClick() {
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
      showMessage(
        resultEl,
        "No recommendations found. Add projects or adjust your profile.",
      );
      return;
    }

    // return array sorted by score desc
    const top = recommendations[0];

    const title = escapeHtml(top.title ?? "Untitled");
    const score =
      top.score !== undefined && top.score !== null
        ? escapeHtml(top.score)
        : "";
    const reasons = Array.isArray(top.reasons) ? top.reasons : [];

    resultEl.innerHTML = `
      <div class="border rounded p-3">
        <div class="fw-semibold">Recommended Project</div>
        <div class="fs-5">${title}</div>
        ${score !== "" ? `<div class="small text-muted">Score: ${score}</div>` : ""}

        ${
          reasons.length > 0
            ? `<div class="mt-2">
                 <div class="fw-semibold small">Why this one?</div>
                 <ul class="small mb-0">
                   ${reasons.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
                 </ul>
               </div>`
            : `<div class="small text-muted mt-2">No explanation provided.</div>`
        }
      </div>
    `;
  } catch (error) {
    console.error(error);
    showMessage(resultEl, `Recommendation failed: ${error.message}`);
  }
}
