import { TaskManager } from '../main.js';
import * as processor from '../taskProcessor.js';
import { 
  uiLoadDataBtn, 
  uiShowStatsBtn, 
  uiShowUsersBtn, 
  uiClearDataBtn, 
  uiStatusFilter, 
  uiSearchInput, 
  uiErrorMessage, 
  uiOutputContent 
} from '../utils/elements.js';
import { getDocument } from '../utils/getDocument.js';
import { createStatsCardHTML, createTaskListItem, createUserListItem, createSeeMoreButton } from '../utils/templates.js';

class TaskManagerUI {
  constructor() {
    this.taskManager = new TaskManager();
    this.currentTasks = [];
    this.currentView = 'tasks';
    this.displayedTaskCount = 20;
    this.attachEventListeners();
  }

  attachEventListeners() {
    uiLoadDataBtn.addEventListener('click', () => this.handleLoadData());
    uiShowStatsBtn.addEventListener('click', () => this.handleShowStats());
    uiShowUsersBtn.addEventListener('click', () => this.handleShowUsers());
    uiClearDataBtn.addEventListener('click', () => this.handleClearData());
    uiStatusFilter.addEventListener('change', () => this.handleFilterChange());
    uiSearchInput.addEventListener('input', () => this.handleSearch());
    
    // add task form handler
    const addTaskForm = getDocument('addTaskForm', 'id');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
    }
  }

  showError(message) {
    uiErrorMessage.textContent = message;
    uiErrorMessage.hidden = false;
  }

  hideError() {
    uiErrorMessage.hidden = true;
  }

  enableControls() {
    if (this.taskManager.isDataLoaded) {
      uiShowStatsBtn.disabled = false;
      uiShowUsersBtn.disabled = false;
      uiClearDataBtn.disabled = false;
      uiStatusFilter.disabled = false;
      uiSearchInput.disabled = false;
      
      const addTaskBtn = getDocument('addTaskBtn', 'id');
      if (addTaskBtn) {
        addTaskBtn.disabled = false;
      }
    }
  }

  disableControls() {
    uiShowStatsBtn.disabled = true;
    uiShowUsersBtn.disabled = true;
    uiClearDataBtn.disabled = true;
    uiStatusFilter.disabled = true;
    uiSearchInput.disabled = true;
    
    const addTaskBtn = getDocument('addTaskBtn', 'id');
    if (addTaskBtn) {
      addTaskBtn.disabled = true;
    }
  }

  async handleLoadData() {
    this.hideError();
    uiLoadDataBtn.disabled = true;

    try {
      await this.taskManager.loadData();
      
      if (!this.taskManager.tasks || this.taskManager.tasks.length === 0) {
        throw new Error('No tasks were loaded from the API');
      }
      
      this.currentTasks = this.taskManager.tasks;
      this.enableControls();
      this.displayTasksView();
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      let userMessage = `Failed to load data: ${errorMessage}`;
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Network error')) {
        userMessage += '. Please check your internet connection and try again.';
      }
      
      this.showError(userMessage);
      this.disableControls();
    } finally {
      uiLoadDataBtn.disabled = false;
    }
  }

  initializeFromCache() {
    if (this.taskManager.loadFromCache()) {
      this.currentTasks = this.taskManager.tasks;
      this.enableControls();
      this.displayTasksView();
      return true;
    }
    return false;
  }

  handleShowStats() {
    if (this.taskManager.isDataLoaded) {
      this.currentView = 'stats';
      this.displayStatisticsView();
    } else {
      this.showError('No data available. Please load data first.');
    }
  }

  handleShowUsers() {
    if (this.taskManager.isDataLoaded) {
      this.currentView = 'users';
      this.displayUsers();
    } else {
      this.showError('No data available. Please load data first.');
    }
  }

  handleClearData() {
    uiOutputContent.innerHTML = '';
    uiStatusFilter.value = '';
    uiSearchInput.value = '';
    this.currentTasks = this.taskManager.tasks;
  }

  handleFilterChange() {
    this.applyFilters();
  }

  handleSearch() {
    this.applyFilters();
  }

  // apply both status filter and search filter, reset pagination
  applyFilters() {
    let filteredTasks = [...this.taskManager.tasks];

    const statusFilter = uiStatusFilter.value;
    if (statusFilter) {
      filteredTasks = processor.filterByStatus(filteredTasks, statusFilter);
    }

    const searchTerm = uiSearchInput.value.trim();
    if (searchTerm) {
      filteredTasks = processor.searchTasks(filteredTasks, searchTerm);
    }

    this.currentTasks = filteredTasks;
    this.displayedTaskCount = 20; // reset to show first 20 items
    this.displayTasksView();
  }

  displayStatisticsView() {
    // use filtered tasks if available, otherwise use all tasks
    const tasksToAnalyze = this.currentTasks.length > 0 ? this.currentTasks : this.taskManager.tasks;
    const stats = processor.calculateStatistics(tasksToAnalyze);
    // check if currently showing filtered results
    const isFiltered = this.currentTasks.length !== this.taskManager.tasks.length;
    
    const graphHTML = this.createStatsGraph(stats, isFiltered);
    uiOutputContent.innerHTML = graphHTML;
  }

  // create bar chart graph visualization
  createStatsGraph(stats, isFiltered = false) {
    const maxValue = Math.max(stats.total, stats.completed, stats.pending, stats.overdue, 1);
    const barHeight = 200;
    const barWidth = 80;
    const spacing = 30;
    const svgWidth = 400;
    const svgHeight = barHeight + 100;
    
    // calculate bar heights as percentages
    const totalHeight = (stats.total / maxValue) * barHeight;
    const completedHeight = (stats.completed / maxValue) * barHeight;
    const pendingHeight = (stats.pending / maxValue) * barHeight;
    const overdueHeight = (stats.overdue / maxValue) * barHeight;
    
    // x positions for bars
    const x1 = 50;
    const x2 = x1 + barWidth + spacing;
    const x3 = x2 + barWidth + spacing;
    const x4 = x3 + barWidth + spacing;
    
    return `
      <section class="statistics-card" aria-labelledby="stats-heading">
        <h2 id="stats-heading">Task Statistics${isFiltered ? ' (Filtered)' : ''}</h2>
        <div class="graph-container">
          <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" aria-label="Task statistics bar chart">
            <!-- grid lines -->
            <line x1="40" y1="${barHeight + 10}" x2="${svgWidth - 10}" y2="${barHeight + 10}" stroke="#ddd" stroke-width="2"/>
            <line x1="40" y1="${barHeight + 10 - (barHeight / 4)}" x2="${svgWidth - 10}" y2="${barHeight + 10 - (barHeight / 4)}" stroke="#eee" stroke-width="1"/>
            <line x1="40" y1="${barHeight + 10 - (barHeight / 2)}" x2="${svgWidth - 10}" y2="${barHeight + 10 - (barHeight / 2)}" stroke="#eee" stroke-width="1"/>
            <line x1="40" y1="${barHeight + 10 - (barHeight * 3 / 4)}" x2="${svgWidth - 10}" y2="${barHeight + 10 - (barHeight * 3 / 4)}" stroke="#eee" stroke-width="1"/>
            <line x1="40" y1="10" x2="${svgWidth - 10}" y2="10" stroke="#eee" stroke-width="1"/>
            
            <!-- bars -->
            <rect x="${x1}" y="${barHeight + 10 - totalHeight}" width="${barWidth}" height="${totalHeight}" fill="#333" aria-label="Total tasks: ${stats.total}"/>
            <rect x="${x2}" y="${barHeight + 10 - completedHeight}" width="${barWidth}" height="${completedHeight}" fill="#28a745" aria-label="Completed tasks: ${stats.completed}"/>
            <rect x="${x3}" y="${barHeight + 10 - pendingHeight}" width="${barWidth}" height="${pendingHeight}" fill="#ffc107" aria-label="Pending tasks: ${stats.pending}"/>
            <rect x="${x4}" y="${barHeight + 10 - overdueHeight}" width="${barWidth}" height="${overdueHeight}" fill="#dc3545" aria-label="Overdue tasks: ${stats.overdue}"/>
            
            <!-- labels -->
            <text x="${x1 + barWidth / 2}" y="${barHeight + 35}" text-anchor="middle" font-size="12" fill="#333">Total</text>
            <text x="${x1 + barWidth / 2}" y="${barHeight + 8 - totalHeight}" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">${stats.total}</text>
            
            <text x="${x2 + barWidth / 2}" y="${barHeight + 35}" text-anchor="middle" font-size="12" fill="#333">Completed</text>
            <text x="${x2 + barWidth / 2}" y="${barHeight + 8 - completedHeight}" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">${stats.completed}</text>
            
            <text x="${x3 + barWidth / 2}" y="${barHeight + 35}" text-anchor="middle" font-size="12" fill="#333">Pending</text>
            <text x="${x3 + barWidth / 2}" y="${barHeight + 8 - pendingHeight}" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">${stats.pending}</text>
            
            <text x="${x4 + barWidth / 2}" y="${barHeight + 35}" text-anchor="middle" font-size="12" fill="#333">Overdue</text>
            <text x="${x4 + barWidth / 2}" y="${barHeight + 8 - overdueHeight}" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">${stats.overdue}</text>
            
            <!-- y-axis label -->
            <text x="15" y="${barHeight / 2 + 10}" text-anchor="middle" font-size="12" fill="#666" transform="rotate(-90 15 ${barHeight / 2 + 10})">Count</text>
          </svg>
        </div>
        <div class="stat-summary">
          <p><strong>Completion Rate:</strong> ${stats.completionRate}%</p>
        </div>
      </section>
    `;
  }

  displayTasksView() {
    this.currentView = 'tasks';
    
    const stats = processor.calculateStatistics(this.currentTasks);
    // pagination: show only first N items
    const tasksToShow = this.currentTasks.slice(0, this.displayedTaskCount);
    const hasMore = this.currentTasks.length > this.displayedTaskCount;
    // check if currently showing filtered results
    const isFiltered = this.currentTasks.length !== this.taskManager.tasks.length;
    
    let contentHTML = createStatsCardHTML(stats, 'task-overview-heading', isFiltered, false);

    if (this.currentTasks.length === 0) {
      contentHTML += `
        <section class="task-card" aria-labelledby="tasks-heading">
          <h2 id="tasks-heading">Tasks</h2>
          <p>No tasks found.</p>
        </section>
      `;
    } else {
      contentHTML += `
        <section class="task-card" aria-labelledby="tasks-list-heading">
          <h2 id="tasks-list-heading">Tasks (${this.currentTasks.length} total)</h2>
          <ul class="task-list" role="list" aria-label="Task list">
            ${tasksToShow.map(task => createTaskListItem(task)).join('')}
          </ul>
          ${hasMore ? createSeeMoreButton(this.currentTasks.length - this.displayedTaskCount, 'tasks', 'seeMoreTasksBtn') : ''}
        </section>
      `;
    }

    uiOutputContent.innerHTML = contentHTML;
    this.attachSeeMoreHandler();
  }

  // attach handler to dynamically created see more button
  // uses querySelector because button is created via innerHTML, not in initial dom
  attachSeeMoreHandler() {
    const seeMoreBtn = uiOutputContent.querySelector('#seeMoreTasksBtn');
    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', () => {
        this.displayedTaskCount = this.currentTasks.length;
        this.displayTasksView();
      });
    }
  }

  displayUsers() {
    const users = this.taskManager.getUsersWithStats();
    // pagination: show only first N items
    const usersToShow = users.slice(0, this.displayedTaskCount);
    const hasMore = users.length > this.displayedTaskCount;
    
    const usersHTML = `
      <section class="user-card" aria-labelledby="users-heading">
        <h2 id="users-heading">User Statistics (${users.length} users)</h2>
        <ul class="user-list" role="list" aria-label="User list">
          ${usersToShow.map(user => createUserListItem(user)).join('')}
        </ul>
        ${hasMore ? createSeeMoreButton(users.length - this.displayedTaskCount, 'users', 'seeMoreUsersBtn') : ''}
      </section>
    `;

    uiOutputContent.innerHTML = usersHTML;
    this.attachSeeMoreUsersHandler();
  }

  // attach handler to dynamically created see more button for users
  // uses querySelector because button is created via innerHTML, not in initial dom
  attachSeeMoreUsersHandler() {
    const seeMoreBtn = uiOutputContent.querySelector('#seeMoreUsersBtn');
    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', () => {
        this.displayedTaskCount = this.taskManager.users.length;
        this.displayUsers();
      });
    }
  }

  // handle add task form submission
  handleAddTask(e) {
    e.preventDefault();
    this.hideError();
    
    const titleInput = getDocument('taskTitle', 'id');
    const userIdInput = getDocument('taskUserId', 'id');
    const completedInput = getDocument('taskCompleted', 'id');
    
    if (!titleInput || !userIdInput || !completedInput) return;
    
    const title = titleInput.value.trim();
    const userId = parseInt(userIdInput.value, 10);
    const completed = completedInput.checked;
    
    if (!title) {
      this.showError('Task title is required');
      return;
    }
    
    if (!this.taskManager.isDataLoaded) {
      this.showError('Please load data first');
      return;
    }
    
    try {
      const newTask = this.taskManager.addTask(title, userId, completed);
      
      // update current tasks if showing tasks view
      if (this.currentView === 'tasks') {
        this.currentTasks = this.taskManager.tasks;
        this.displayTasksView();
      }
      
      // clear form
      titleInput.value = '';
      userIdInput.value = '';
      completedInput.checked = false;
      
      // show success message briefly
      this.hideError();
      const successMsg = document.createElement('div');
      successMsg.className = 'success';
      successMsg.textContent = `Task added: "${newTask.title}" (ID: ${newTask.id})`;
      successMsg.style.cssText = 'padding: 10px; margin: 10px 0; background: #d4edda; border: 1px solid #c3e6cb; color: #155724; border-radius: 4px;';
      uiOutputContent.insertBefore(successMsg, uiOutputContent.firstChild);
      
      // remove success message after 3 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 3000);
      
    } catch (error) {
      this.showError(`Failed to add task: ${error.message}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new TaskManagerUI();
  ui.initializeFromCache();
});
