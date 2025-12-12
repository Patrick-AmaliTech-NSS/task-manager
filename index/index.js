import { TaskManager } from '../main.js';
import { 
  indexLoadDataBtn, 
  indexShowStatsBtn, 
  indexShowUsersBtn, 
  indexFilterCompletedBtn, 
  indexFilterPendingBtn, 
  indexFilterAllBtn, 
  indexStatusDiv, 
  indexOutputDiv 
} from '../utils/elements.js';
import { getDocument } from '../utils/getDocument.js';
import { createStatsHTML, createSimpleTaskListItem, createSimpleUserListItem, createSeeMoreButton } from '../utils/templates.js';

const initializeApp = () => {
  const taskManager = new TaskManager();
  let displayedTaskCount = 10;
  let currentTaskList = [];
  let currentView = '';

  const updateStatus = (message) => {
    indexStatusDiv.textContent = message;
  };

  const clearOutput = () => {
    indexOutputDiv.innerHTML = '';
    displayedTaskCount = 10;
  };


  const enableButtons = () => {
    indexShowStatsBtn.disabled = false;
    indexShowUsersBtn.disabled = false;
    indexFilterCompletedBtn.disabled = false;
    indexFilterPendingBtn.disabled = false;
    indexFilterAllBtn.disabled = false;
    
    const addTaskBtn = getDocument('addTaskBtn', 'id');
    if (addTaskBtn) {
      addTaskBtn.disabled = false;
    }
  };

  const disableButtons = () => {
    indexShowStatsBtn.disabled = true;
    indexShowUsersBtn.disabled = true;
    indexFilterCompletedBtn.disabled = true;
    indexFilterPendingBtn.disabled = true;
    indexFilterAllBtn.disabled = true;
    
    const addTaskBtn = getDocument('addTaskBtn', 'id');
    if (addTaskBtn) {
      addTaskBtn.disabled = true;
    }
  };

  // attach handler to dynamically created see more button
  // uses querySelector because button is created via innerHTML, not in initial dom
  const attachSeeMoreHandler = () => {
    const seeMoreBtn = indexOutputDiv.querySelector('#seeMoreBtn');
    if (seeMoreBtn) {
      seeMoreBtn.addEventListener('click', () => {
        displayedTaskCount = currentTaskList.length;
        renderCurrentView();
        console.log(`Showing all ${currentTaskList.length} items`);
      });
    }
  };

  const renderCurrentView = () => {
    if (currentView === 'stats') {
      renderStats();
    } else if (currentView === 'users') {
      renderUsers();
    } else if (currentView === 'completed') {
      renderCompletedTasks();
    } else if (currentView === 'pending') {
      renderPendingTasks();
    } else if (currentView === 'all') {
      renderAllTasks();
    }
  };

  const renderStats = () => {
    const stats = taskManager.getStatistics();
    const statsHTML = createStatsHTML(stats);
    indexOutputDiv.innerHTML = statsHTML;
    updateStatus('Statistics displayed');
    console.log('Statistics:', stats);
  };

  const renderUsers = () => {
    const users = taskManager.getUsersWithStats();
    // pagination: show only first N items
    const usersToShow = users.slice(0, displayedTaskCount);
    const hasMore = users.length > displayedTaskCount;
    
    const usersHTML = `
      <section>
        <h3>Users (${users.length} total)</h3>
        <ul>
          ${usersToShow.map(user => createSimpleUserListItem(user)).join('')}
        </ul>
        ${hasMore ? createSeeMoreButton(users.length - displayedTaskCount, 'users') : ''}
      </section>
    `;
    indexOutputDiv.innerHTML = usersHTML;
    currentTaskList = users;
    attachSeeMoreHandler();
    updateStatus(`Showing ${usersToShow.length} of ${users.length} users`);
    console.log('Users:', users);
  };

  const renderCompletedTasks = () => {
    const completedTasks = taskManager.getTasksByStatus('completed');
    currentTaskList = completedTasks;
    const tasksToShow = completedTasks.slice(0, displayedTaskCount);
    const hasMore = completedTasks.length > displayedTaskCount;
    
    const tasksHTML = `
      <section>
        <h3>Completed Tasks (${completedTasks.length} total)</h3>
        <ul>
          ${tasksToShow.map(task => createSimpleTaskListItem(task)).join('')}
        </ul>
        ${hasMore ? createSeeMoreButton(completedTasks.length - displayedTaskCount, 'completed tasks') : ''}
      </section>
    `;
    indexOutputDiv.innerHTML = tasksHTML;
    attachSeeMoreHandler();
    updateStatus(`Showing ${tasksToShow.length} of ${completedTasks.length} completed tasks`);
    console.log('Completed tasks:', completedTasks);
  };

  const renderPendingTasks = () => {
    const pendingTasks = taskManager.getTasksByStatus('pending');
    currentTaskList = pendingTasks;
    const tasksToShow = pendingTasks.slice(0, displayedTaskCount);
    const hasMore = pendingTasks.length > displayedTaskCount;
    
    const tasksHTML = `
      <section>
        <h3>Pending Tasks (${pendingTasks.length} total)</h3>
        <ul>
          ${tasksToShow.map(task => createSimpleTaskListItem(task)).join('')}
        </ul>
        ${hasMore ? createSeeMoreButton(pendingTasks.length - displayedTaskCount, 'pending tasks') : ''}
      </section>
    `;
    indexOutputDiv.innerHTML = tasksHTML;
    attachSeeMoreHandler();
    updateStatus(`Showing ${tasksToShow.length} of ${pendingTasks.length} pending tasks`);
    console.log('Pending tasks:', pendingTasks);
  };

  const renderAllTasks = () => {
    const stats = taskManager.getStatistics();
    const allTasksHTML = `
      <section>
        <h3>All Tasks (${stats.total} total)</h3>
        <p>Completed: ${stats.completed} | Pending: ${stats.pending} | Overdue: ${stats.overdue}</p>
        <p>Completion Rate: ${stats.completionRate}%</p>
      </section>
    `;
    indexOutputDiv.innerHTML = allTasksHTML;
    updateStatus(`Showing all ${stats.total} tasks`);
    console.log('All tasks:', taskManager.tasks);
  };

  indexLoadDataBtn.addEventListener('click', async () => {
    indexLoadDataBtn.disabled = true;
    updateStatus('Loading...');
    clearOutput();
    
    try {
      const { users, tasks } = await taskManager.loadData();
      updateStatus(`Data loaded: ${users.length} users, ${tasks.length} tasks`);
      enableButtons();
      
      console.log('Users:', users);
      console.log('Tasks:', tasks);
    } catch (error) {
      updateStatus(`Error: ${error.message}`);
      console.error('Error loading data:', error);
      disableButtons();
    } finally {
      indexLoadDataBtn.disabled = false;
    }
  });

  indexShowStatsBtn.addEventListener('click', () => {
    currentView = 'stats';
    displayedTaskCount = 10;
    renderStats();
  });

  indexShowUsersBtn.addEventListener('click', () => {
    currentView = 'users';
    displayedTaskCount = 10;
    renderUsers();
  });

  indexFilterCompletedBtn.addEventListener('click', () => {
    currentView = 'completed';
    displayedTaskCount = 10;
    renderCompletedTasks();
  });

  indexFilterPendingBtn.addEventListener('click', () => {
    currentView = 'pending';
    displayedTaskCount = 10;
    renderPendingTasks();
  });

  indexFilterAllBtn.addEventListener('click', () => {
    currentView = 'all';
    displayedTaskCount = 10;
    renderAllTasks();
  });

  // add task form handler
  const addTaskForm = getDocument('addTaskForm', 'id');
  const addTaskBtn = getDocument('addTaskBtn', 'id');
  
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const titleInput = getDocument('taskTitle', 'id');
      const userIdInput = getDocument('taskUserId', 'id');
      const completedInput = getDocument('taskCompleted', 'id');
      
      if (!titleInput || !userIdInput || !completedInput) return;
      
      const title = titleInput.value.trim();
      const userId = parseInt(userIdInput.value, 10);
      const completed = completedInput.checked;
      
      if (!title) {
        updateStatus('Error: Task title is required');
        console.error('Task title is required');
        return;
      }
      
      if (!taskManager.isDataLoaded) {
        updateStatus('Error: Please load data first');
        console.error('Data not loaded. Please load data first.');
        return;
      }
      
      try {
        const newTask = taskManager.addTask(title, userId, completed);
        updateStatus(`Task added: "${newTask.title}" (ID: ${newTask.id})`);
        console.log('New task added:', newTask);
        console.log('Total tasks:', taskManager.tasks.length);
        
        // clear form
        titleInput.value = '';
        userIdInput.value = '';
        completedInput.checked = false;
        
        // refresh current view if showing tasks
        if (currentView === 'all' || currentView === 'completed' || currentView === 'pending') {
          renderCurrentView();
        }
      } catch (error) {
        updateStatus(`Error: ${error.message}`);
        console.error('Error adding task:', error);
      }
    });
  }
  
  // attach handler to static route button in html
  const uiRouteBtn = getDocument('uiRouteBtn', 'id');
  if (uiRouteBtn) {
    uiRouteBtn.addEventListener('click', () => {
      window.location.href = 'ui/ui.html';
    });
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
