const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

class APIClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchTodos() {
    try {
      const response = await fetch(`${this.baseUrl}/todos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const todos = await response.json();
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error(`Failed to fetch todos: ${error.message}`);
    }
  }

  async fetchUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async fetchUserTodos(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/todos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const todos = await response.json();
      return todos;
    } catch (error) {
      console.error(`Error fetching todos for user ${userId}:`, error);
      throw new Error(`Failed to fetch user todos: ${error.message}`);
    }
  }

  // fetch users and todos concurrently using promise.all
  async fetchAllData() {
    try {
      const [users, todos] = await Promise.all([
        this.fetchUsers(),
        this.fetchTodos()
      ]);

      return { users, todos };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw new Error(`Failed to fetch all data: ${error.message}`);
    }
  }
}

export { APIClient };

