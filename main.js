import { APIClient } from './api.js';
import { Task, PriorityTask, User } from './models.js';
import * as processor from './taskProcessor.js';

class TaskManager {
  constructor() {
    this.apiClient = new APIClient();
    this.users = [];
    this.tasks = [];
    this.userMap = new Map();
    this.isDataLoaded = false;
  }

  async loadData() {
    try {
      console.log('Fetching data from API...');
      const { users: usersData, todos: todosData } = await this.apiClient.fetchAllData();
      
      this.tasks = processor.transformToTaskInstances(todosData);
      this.users = usersData.map(userData => {
        const userTasks = processor.filterByUser(this.tasks, userData.id);
        return new User({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          tasks: userTasks
        });
      });

      this.userMap = processor.groupByUser(this.tasks);
      this.isDataLoaded = true;
      
      this.cacheData();
      
      console.log(`Loaded ${this.users.length} users and ${this.tasks.length} tasks`);
      return { users: this.users, tasks: this.tasks };
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  // save data to localStorage for cross-page sharing
  cacheData() {
    const cacheData = {
      users: this.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        tasks: user.tasks.map(task => task.toJSON())
      })),
      tasks: this.tasks.map(task => task.toJSON()),
      timestamp: Date.now()
    };
    localStorage.setItem('taskManagerData', JSON.stringify(cacheData));
  }

  // load data from cache if available and not expired
  loadFromCache() {
    const cached = localStorage.getItem('taskManagerData');
    if (!cached) return false;

    const cacheData = JSON.parse(cached);
    const maxAge = 5 * 60 * 1000;
    
    // check if cache is expired
    if (Date.now() - cacheData.timestamp > maxAge) {
      localStorage.removeItem('taskManagerData');
      return false;
    }

    this.tasks = cacheData.tasks.map(taskData => new Task(taskData));
    this.users = cacheData.users.map(userData => {
      const userTasks = userData.tasks.map(taskData => new Task(taskData));
      return new User({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        tasks: userTasks
      });
    });

    this.userMap = processor.groupByUser(this.tasks);
    this.isDataLoaded = true;
    
    console.log(`Loaded ${this.users.length} users and ${this.tasks.length} tasks from cache`);
    return true;
  }

  // validate that data has been loaded before allowing operations
  ensureDataLoaded() {
    if (!this.isDataLoaded) {
      throw new Error('Data not loaded. Please load data first.');
    }
  }

  getStatistics() {
    this.ensureDataLoaded();
    return processor.calculateStatistics(this.tasks);
  }

  getUsersWithStats() {
    this.ensureDataLoaded();
    return this.users.map(user => user.toJSON());
  }

  getTasksByStatus(status) {
    this.ensureDataLoaded();
    return processor.filterByStatus(this.tasks, status);
  }

  getTasksByUser(userId) {
    this.ensureDataLoaded();
    return processor.filterByUser(this.tasks, userId);
  }

  getTasksByPriority(priority) {
    this.ensureDataLoaded();
    return processor.filterByPriority(this.tasks, priority);
  }

  searchTasks(searchTerm) {
    this.ensureDataLoaded();
    return processor.searchTasks(this.tasks, searchTerm);
  }

  getSortedTasks(criteria = {}) {
    this.ensureDataLoaded();
    return processor.sortTasks(this.tasks, criteria);
  }

  getUniquePriorities() {
    this.ensureDataLoaded();
    return Array.from(processor.extractUniqueCategories(this.tasks));
  }

  // add new task to tasks array, update userMap, and save to localStorage
  addTask(title, userId, completed = false) {
    this.ensureDataLoaded();
    
    // generate new id (max existing id + 1)
    const maxId = this.tasks.length > 0 
      ? Math.max(...this.tasks.map(task => task.id)) 
      : 0;
    const newId = maxId + 1;
    
    const newTask = new Task({
      id: newId,
      title: title,
      completed: completed,
      userId: userId
    });
    
    this.tasks.push(newTask);
    
    // update user's tasks if user exists
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.addTask(newTask);
    }
    
    // update userMap
    this.userMap = processor.groupByUser(this.tasks);    
    this.cacheData();
    
    console.log(`Task added: ${newTask.title} (ID: ${newTask.id}, User: ${newTask.userId})`);
    return newTask;
  }
}

export { TaskManager };

