class Task {
  constructor({ id, title, completed, userId }) {
    this.id = id;
    this.title = title;
    this.completed = completed ?? false;
    this.userId = userId;
  }

  toggle() {
    this.completed = !this.completed;
    return this.completed;
  }

  isOverdue() {
    return false;
  }

  getStatus() {
    return this.completed ? 'completed' : 'pending';
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      userId: this.userId,
      status: this.getStatus()
    };
  }
}

class PriorityTask extends Task {
  constructor({ id, title, completed, userId, priority = 'medium', dueDate = null }) {
    super({ id, title, completed, userId });
    this.priority = priority;
    this.dueDate = dueDate ? new Date(dueDate) : null;
  }

  // check if task is overdue: must have dueDate, not completed, and past due date
  isOverdue() {
    if (!this.dueDate) {
      return false;
    }
    return !this.completed && new Date() > this.dueDate;
  }

  getStatus() {
    if (this.isOverdue()) {
      return 'overdue';
    }
    return this.completed ? 'completed' : 'pending';
  }

  // return numeric priority level for sorting (defaults to medium)
  getPriorityLevel() {
    const priorityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4
    };
    return priorityLevels[this.priority?.toLowerCase()] ?? 2;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      priority: this.priority,
      dueDate: this.dueDate?.toISOString() ?? null,
      isOverdue: this.isOverdue()
    };
  }
}

class User {
  constructor({ id, name, email, tasks = [] }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.tasks = tasks;
  }

  addTask(task) {
    if (task instanceof Task) {
      this.tasks.push(task);
    } else {
      throw new Error('Task must be an instance of Task class');
    }
  }

  // calculate completion percentage for user's tasks
  getCompletionRate() {
    if (this.tasks.length === 0) {
      return 0;
    }

    const completedCount = this.tasks.filter(task => task.completed).length;
    return Math.round((completedCount / this.tasks.length) * 100);
  }

  getTasksByStatus(status) {
    return this.tasks.filter(task => task.getStatus() === status);
  }

  getTaskCount() {
    return {
      total: this.tasks.length,
      completed: this.getTasksByStatus('completed').length,
      pending: this.getTasksByStatus('pending').length,
      overdue: this.getTasksByStatus('overdue').length
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      taskCount: this.getTaskCount(),
      completionRate: this.getCompletionRate()
    };
  }
}

export { Task, PriorityTask, User };

