class Task {
  constructor({ id, title, completed, userId }) {
    this.id = id;
    this.title = title;
    this.completed = completed ?? false;
    this.userId = userId;
  }

  getStatus() {
    return this.completed ? 'completed' : 'pending';
  }
}

export { Task };

