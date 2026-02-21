const API_URL = "/api";

// DOM Elements
const statsContainer = document.getElementById("stats-container");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
});

// Load Statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/projects/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const stats = await response.json();
    renderStats(stats);
  } catch (error) {
    console.error("Error loading stats:", error);
    statsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Failed to load statistics</h3>
        <p>${escapeHtml(error.message)}</p>
        <button class="btn btn-primary" onclick="loadStats()">Retry</button>
      </div>
    `;
  }
}

// Render Statistics
function renderStats(stats) {
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${stats.totalProjects}</div>
      <div class="stat-label">Total Projects</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">${stats.activeProjects}</div>
      <div class="stat-label">Active Projects</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">${stats.completedProjects}</div>
      <div class="stat-label">Completed</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">${stats.abandonedProjects}</div>
      <div class="stat-label">Abandoned</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-value">${stats.completionRate}%</div>
      <div class="stat-label">Completion Rate</div>
    </div>
    
    ${
      stats.recentCompletions && stats.recentCompletions.length > 0
        ? `
      <div class="recent-completions recent-completions--full-width">
        <h3 class="recent-completions-title">Recent Completions</h3>
        ${stats.recentCompletions
          .map(
            (project) => `
          <div class="completion-item">
            <div class="completion-name">
              ${escapeHtml(project.name)}
            </div>
            <div class="completion-date">
              Completed: ${new Date(project.completedAt).toLocaleDateString()}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
        : ""
    }
  `;
}

// Utility: escape HTML
function escapeHtml(text = "") {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
