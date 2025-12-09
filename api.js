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
      throw error;
    }
  }
}

export { APIClient };

