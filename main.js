import { APIClient } from './api.js';
import * as processor from './taskProcessor.js';

class TaskManager {
  constructor() {
    this.apiClient = new APIClient();
    this.tasks = [];
  }
  
  async loadTasks() {
    try {
      console.log('Fetching tasks from API...');
      const todosData = await this.apiClient.fetchTodos();
      
      this.tasks = processor.transformToTaskInstances(todosData);
      
      console.log(`Loaded ${this.tasks.length} tasks`);
      console.log('Tasks:', this.tasks);
      return this.tasks;
    } catch (error) {
      console.error('Failed to load tasks:', error);
      throw error;
    }
  }
}

const initializeApp = () => {
  const taskManager = new TaskManager();
  const loadBtn = document.getElementById('loadDataBtn');
  const statusDiv = document.getElementById('status');

  loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    statusDiv.textContent = 'Loading...';
    
    try {
      await taskManager.loadTasks();
      statusDiv.textContent = 'Data loaded';
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      console.error('Error loading tasks:', error);
    } finally {
      loadBtn.disabled = false;
    }
  });
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeApp);
}

export { TaskManager };

