import api from './api';

/**
 * Normalize todo object - converts _id to id for consistency
 */
const normalizeTodo = (todo) => {
  if (!todo) return null;
  
  return {
    ...todo,
    id: todo.id || todo._id,
  };
};

/**
 * Get all todos for the authenticated user
 */
export const getTodos = async () => {
  try {
    const response = await api.get('/todos');
    return response.data.map(normalizeTodo);
  } catch (error) {
    console.error('Get todos error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch todos');
  }
};

/**
 * Create a new todo
 */
export const createTodo = async (todoData) => {
  try {
    const response = await api.post('/todos', todoData);
    return normalizeTodo(response.data);
  } catch (error) {
    console.error('Create todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create todo');
  }
};

/**
 * Update an existing todo
 */
export const updateTodo = async (todoId, updates) => {
  try {
    const response = await api.put(`/todos/${todoId}`, updates);
    return normalizeTodo(response.data);
  } catch (error) {
    console.error('Update todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update todo');
  }
};

/**
 * Delete a todo
 */
export const deleteTodo = async (todoId) => {
  try {
    const response = await api.delete(`/todos/${todoId}`);
    return response.data;
  } catch (error) {
    console.error('Delete todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete todo');
  }
};

/**
 * Toggle todo completion status
 */
export const toggleTodoCompletion = async (todoId, completed) => {
  try {
    const response = await api.put(`/todos/${todoId}`, { completed });
    return normalizeTodo(response.data);
  } catch (error) {
    console.error('Toggle todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to toggle todo');
  }
};
