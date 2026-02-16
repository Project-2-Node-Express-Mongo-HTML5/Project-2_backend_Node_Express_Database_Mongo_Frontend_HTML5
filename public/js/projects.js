// API Base URL
const API_URL = 'http://localhost:3000/api';

// State
let currentFilter = 'all';
let sortByPriority = false;
let projects = [];

// DOM Elements
const projectsList = document.getElementById('projects-list');
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const newProjectBtn = document.getElementById('new-project-btn');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancel-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortCheckbox = document.getElementById('sort-by-priority');
const prioritySlider = document.getElementById('priority');
const priorityValue = document.getElementById('priority-value');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  newProjectBtn.addEventListener('click', openNewProjectModal);
  closeModal.addEventListener('click', closeProjectModal);
  cancelBtn.addEventListener('click', closeProjectModal);
  projectForm.addEventListener('submit', handleFormSubmit);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });
  
  sortCheckbox.addEventListener('change', handleSortChange);
  
  prioritySlider.addEventListener('input', (e) => {
    priorityValue.textContent = e.target.value;
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      closeProjectModal();
    }
  });
}

// Navigation
function handleNavigation(e) {
  e.preventDefault();
  const viewName = e.target.dataset.view;
  
  // Update active nav link
  navLinks.forEach(link => link.classList.remove('active'));
  e.target.classList.add('active');
  
  // Show appropriate view
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
    
    if (viewName === 'stats') {
      loadStats();
    }
  }
}

// Load Projects
async function loadProjects() {
  try {
    let url = `${API_URL}/projects`;
    
    if (sortByPriority) {
      url = `${API_URL}/projects/priority`;
    } else if (currentFilter !== 'all') {
      url = `${API_URL}/projects?status=${currentFilter}`;
    }
    
    const response = await fetch(url);
    projects = await response.json();
    
    renderProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
    showError('Failed to load projects');
  }
}

// Render Projects
function renderProjects() {
  if (projects.length === 0) {
    projectsList.innerHTML = `
      <div class="empty-state">
        <h3>No projects found</h3>
        <p>Create your first project to get started!</p>
      </div>
    `;
    return;
  }
  
  projectsList.innerHTML = projects.map(project => `
    <div class="project-card">
      <div class="project-header">
        <h3 class="project-title">${escapeHtml(project.name)}</h3>
        <span class="project-priority">Priority: ${project.intrinsicPriority}</span>
      </div>
      
      ${project.description ? `
        <p class="project-description">${escapeHtml(project.description)}</p>
      ` : ''}
      
      <div class="project-meta">
        <div class="meta-item">
          <span class="meta-label">Time:</span>
          <span>${project.estimatedTimeMinutes} min</span>
        </div>
        <div class="meta-item">
          <span class="effort-badge effort-${project.effortLevel}">${capitalize(project.effortLevel)} Effort</span>
        </div>
        <div class="meta-item">
          <span class="status-badge status-${project.status}">${capitalize(project.status)}</span>
        </div>
      </div>
      
      ${project.season && project.season.length > 0 ? `
        <div class="project-tags">
          ${project.season.map(s => `<span class="tag">🌸 ${capitalize(s)}</span>`).join('')}
        </div>
      ` : ''}
      
      ${project.tags && project.tags.length > 0 ? `
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="project-actions">
        ${project.status === 'active' ? `
          <button class="btn btn-success btn-small" onclick="completeProject('${project._id}')">
            ✓ Complete
          </button>
          <button class="btn btn-danger btn-small" onclick="abandonProject('${project._id}')">
            ✗ Abandon
          </button>
        ` : ''}
        <button class="btn btn-secondary btn-small" onclick="editProject('${project._id}')">
          Edit
        </button>
        <button class="btn btn-danger btn-small" onclick="deleteProject('${project._id}')">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Filter Change
function handleFilterChange(e) {
  filterBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  currentFilter = e.target.dataset.filter;
  loadProjects();
}

// Sort Change
function handleSortChange(e) {
  sortByPriority = e.target.checked;
  loadProjects();
}

// Modal Functions
function openNewProjectModal() {
  document.getElementById('modal-title').textContent = 'New Project';
  projectForm.reset();
  document.getElementById('project-id').value = '';
  priorityValue.textContent = '5';
  projectModal.classList.add('active');
}

function closeProjectModal() {
  projectModal.classList.remove('active');
}

// Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const projectId = document.getElementById('project-id').value;
  const formData = {
    name: document.getElementById('project-name').value,
    description: document.getElementById('project-description').value,
    estimatedTimeMinutes: parseInt(document.getElementById('estimated-time').value),
    effortLevel: document.getElementById('effort-level').value,
    intrinsicPriority: parseInt(document.getElementById('priority').value),
    tags: document.getElementById('project-tags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag),
    season: Array.from(document.querySelectorAll('input[name="season"]:checked'))
      .map(cb => cb.value)
  };
  
  try {
    const url = projectId 
      ? `${API_URL}/projects/${projectId}` 
      : `${API_URL}/projects`;
    
    const method = projectId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('Failed to save project');
    
    closeProjectModal();
    loadProjects();
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Failed to save project');
  }
}

// Edit Project
async function editProject(id) {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`);
    const project = await response.json();
    
    document.getElementById('modal-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = project._id;
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('estimated-time').value = project.estimatedTimeMinutes;
    document.getElementById('effort-level').value = project.effortLevel;
    document.getElementById('priority').value = project.intrinsicPriority;
    document.getElementById('priority-value').textContent = project.intrinsicPriority;
    document.getElementById('project-tags').value = project.tags ? project.tags.join(', ') : '';
    
    // Set season checkboxes
    document.querySelectorAll('input[name="season"]').forEach(cb => {
      cb.checked = project.season && project.season.includes(cb.value);
    });
    
    projectModal.classList.add('active');
  } catch (error) {
    console.error('Error loading project:', error);
    alert('Failed to load project');
  }
}

// Complete Project
async function completeProject(id) {
    console.log('Completing project with ID:', id);
  if (!confirm('Mark this project as completed?')) return;
  
  try {
    const url = `${API_URL}/projects/${id}/complete`;
    console.log('Fetching URL:', url);
    const response = await fetch(`${API_URL}/projects/${id}/complete`, {
      method: 'PATCH'
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData); // ADD THIS
      throw new Error('Failed to complete project');
    }
    
    loadProjects();
  } catch (error) {
    console.error('Error completing project:', error);
    alert('Failed to complete project');
  }
}

// Abandon Project
async function abandonProject(id) {
  if (!confirm('Mark this project as abandoned?')) return;
  
  try {
    const response = await fetch(`${API_URL}/projects/${id}/abandon`, {
      method: 'PATCH'
    });
    
    if (!response.ok) throw new Error('Failed to abandon project');
    
    loadProjects();
  } catch (error) {
    console.error('Error abandoning project:', error);
    alert('Failed to abandon project');
  }
}

// Delete Project
async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
  
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete project');
    
    loadProjects();
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Failed to delete project');
  }
}

// Load Statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/projects/stats`);
    const stats = await response.json();
    
    document.getElementById('stats-container').innerHTML = `
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
        <div class="stat-value">${stats.completionRate}%</div>
        <div class="stat-label">Completion Rate</div>
      </div>
      
      ${stats.recentCompletions && stats.recentCompletions.length > 0 ? `
        <div class="recent-completions" style="grid-column: 1 / -1;">
          <h3>Recent Completions</h3>
          ${stats.recentCompletions.map(project => `
            <div class="completion-item">
              <div class="completion-name">${escapeHtml(project.name)}</div>
              <div class="completion-date">
                Completed: ${new Date(project.completedAt).toLocaleDateString()}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Utility Functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
