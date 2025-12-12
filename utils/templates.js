import { escapeHtml, capitalizeFirst } from './helpers.js';

export const createSeeMoreButton = (remaining, type, buttonId = 'seeMoreBtn') => {
  return `<button id="${buttonId}" class="see-more-btn" aria-label="Show ${remaining} more ${type}">See More (${remaining} remaining)</button>`;
};

export const createStatsHTML = (stats, isFiltered = false) => {
  return `
    <section>
      <h3>Task Statistics${isFiltered ? ' (Filtered)' : ''}</h3>
      <ul>
        <li>Total Tasks: ${stats.total}</li>
        <li>Completed: ${stats.completed}</li>
        <li>Pending: ${stats.pending}</li>
        <li>Overdue: ${stats.overdue}</li>
        <li>Completion Rate: ${stats.completionRate}%</li>
      </ul>
    </section>
  `;
};

export const createStatsCardHTML = (stats, headingId, isFiltered = false, includeOverdue = true) => {
  // conditionally include overdue section based on context
  const overdueSection = includeOverdue ? `
        <div class="stat-item" role="listitem">
          <span class="stat-label">Overdue</span>
          <span class="stat-value">${stats.overdue}</span>
        </div>
  ` : '';
  
  // different title for different views
  const title = includeOverdue ? 'Task Statistics' : 'Task Overview';
  
  return `
    <section class="statistics-card" aria-labelledby="${headingId}">
      <h2 id="${headingId}">${title}${isFiltered ? ' (Filtered)' : ''}</h2>
      <div class="stat-grid" role="list" aria-label="Statistics breakdown">
        <div class="stat-item" role="listitem">
          <span class="stat-label">Total Tasks</span>
          <span class="stat-value">${stats.total}</span>
        </div>
        <div class="stat-item" role="listitem">
          <span class="stat-label">Completed</span>
          <span class="stat-value">${stats.completed}</span>
        </div>
        <div class="stat-item" role="listitem">
          <span class="stat-label">Pending</span>
          <span class="stat-value">${stats.pending}</span>
        </div>
        ${overdueSection}
        <div class="stat-item" role="listitem">
          <span class="stat-label">Completion Rate</span>
          <span class="stat-value">${stats.completionRate}%</span>
        </div>
      </div>
    </section>
  `;
};

export const createTaskListItem = (task) => {
  const taskData = task.toJSON();
  const statusClass = taskData.status;
  return `
    <li class="task-item" role="listitem">
      <h3 class="task-title">${escapeHtml(taskData.title)}</h3>
      <div class="task-meta">
        <span class="badge badge-${statusClass}" aria-label="Status: ${taskData.status}">${capitalizeFirst(taskData.status)}</span>
        <span>User ID: ${taskData.userId}</span>
        <span>Task ID: ${taskData.id}</span>
      </div>
    </li>
  `;
};

export const createSimpleTaskListItem = (task) => {
  return `<li>${escapeHtml(task.title)} (ID: ${task.id}, User: ${task.userId})</li>`;
};

export const createUserListItem = (user) => {
  return `
    <li class="user-item" role="listitem">
      <h3 class="task-title">${escapeHtml(user.name)}</h3>
      <dl class="task-meta">
        <dt>Email:</dt>
        <dd>${escapeHtml(user.email)}</dd>
        <dt>Total Tasks:</dt>
        <dd>${user.taskCount.total}</dd>
        <dt>Completed:</dt>
        <dd>${user.taskCount.completed}</dd>
        <dt>Completion Rate:</dt>
        <dd>${user.completionRate}%</dd>
      </dl>
    </li>
  `;
};

export const createSimpleUserListItem = (user) => {
  return `<li><strong>${escapeHtml(user.name)}</strong> (${escapeHtml(user.email)}) - Tasks: ${user.taskCount.total}, Completed: ${user.taskCount.completed}, Rate: ${user.completionRate}%</li>`;
};

