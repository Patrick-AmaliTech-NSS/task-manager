import { Task, PriorityTask } from './models.js';

const transformToTaskInstances = (todosData) => {
  if (!Array.isArray(todosData)) {
    return [];
  }

  return todosData.map(todo => new Task({
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    userId: todo.userId
  }));
};

const filterByStatus = (tasks, status) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.filter(task => task.getStatus() === status);
};

const filterByUser = (tasks, userId) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.filter(task => task.userId === userId);
};

const filterByPriority = (tasks, priority) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.filter(task => {
    if (task instanceof PriorityTask) {
      return task.priority?.toLowerCase() === priority?.toLowerCase();
    }
    return false;
  });
};

// calculate statistics using reduce to aggregate task counts
const calculateStatistics = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      completionRate: 0
    };
  }

  // use reduce to count tasks by status
  const stats = tasks.reduce((accumulator, task) => {
    accumulator.total += 1;
    
    const status = task.getStatus();
    if (status === 'completed') {
      accumulator.completed += 1;
    } else if (status === 'pending') {
      accumulator.pending += 1;
    } else if (status === 'overdue') {
      accumulator.overdue += 1;
    }

    return accumulator;
  }, {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });

  // calculate completion percentage
  stats.completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return stats;
};

// group tasks by user id using map data structure
const groupByUser = (tasks) => {
  if (!Array.isArray(tasks)) {
    return new Map();
  }

  // use reduce with map to group tasks by userId
  return tasks.reduce((userMap, task) => {
    const userId = task.userId;
    
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    
    userMap.get(userId).push(task);
    
    return userMap;
  }, new Map());
};

// extract unique priority values using set data structure
const extractUniqueCategories = (tasks) => {
  if (!Array.isArray(tasks)) {
    return new Set();
  }

  const categories = new Set();
  
  // set automatically handles uniqueness
  tasks.forEach(task => {
    if (task instanceof PriorityTask && task.priority) {
      categories.add(task.priority);
    }
  });

  return categories;
};

const searchTasks = (tasks, searchTerm) => {
  if (!Array.isArray(tasks) || !searchTerm) {
    return [];
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return tasks.filter(task => 
    task.title?.toLowerCase().includes(lowerSearchTerm) ||
    task.id?.toString().includes(lowerSearchTerm)
  );
};

// sort tasks with custom comparator, supports priority sorting
const sortTasks = (tasks, criteria = {}) => {
  if (!Array.isArray(tasks)) {
    return [];
  }

  // destructure with default values
  const { 
    field = 'id', 
    order = 'asc',
    priority = false 
  } = criteria;

  // create copy to avoid mutating original array
  const sortedTasks = [...tasks];

  sortedTasks.sort((a, b) => {
    let comparison = 0;

    // priority sorting takes precedence if enabled
    if (priority && a instanceof PriorityTask && b instanceof PriorityTask) {
      comparison = b.getPriorityLevel() - a.getPriorityLevel();
      if (comparison !== 0) {
        return order === 'asc' ? -comparison : comparison;
      }
    }

    // sort by specified field
    if (field === 'id') {
      comparison = a.id - b.id;
    } else if (field === 'title') {
      comparison = (a.title || '').localeCompare(b.title || '');
    } else if (field === 'status') {
      comparison = a.getStatus().localeCompare(b.getStatus());
    } else if (field === 'userId') {
      comparison = a.userId - b.userId;
    }

    // reverse comparison for descending order
    return order === 'asc' ? comparison : -comparison;
  });

  return sortedTasks;
};

export {
  transformToTaskInstances,
  filterByStatus,
  filterByUser,
  filterByPriority,
  calculateStatistics,
  groupByUser,
  extractUniqueCategories,
  searchTasks,
  sortTasks
};

