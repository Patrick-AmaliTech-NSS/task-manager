import { Task } from './models.js';

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

export { transformToTaskInstances };

