import api from './api';

const normalizeCalendarTodo = (todo) => {
  if (!todo) return null;

  return {
    ...todo,
    id: todo.id || todo._id,
    dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    createdAt: todo.createdAt ? new Date(todo.createdAt) : null,
    updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : null,
    completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
  };
};

export const getCalendarTodos = async ({ startDate, endDate, category, priority } = {}) => {
  try {
    const params = {};

    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    if (category) params.category = category;
    if (priority) params.priority = priority;

    const response = await api.get('/calendar-todos', { params });
    return response.data.map(normalizeCalendarTodo);
  } catch (error) {
    console.error('Fetch calendar todos error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to load calendar todos');
  }
};

export const createCalendarTodo = async (todoData) => {
  try {
    const response = await api.post('/calendar-todos', todoData);
    return normalizeCalendarTodo(response.data);
  } catch (error) {
    console.error('Create calendar todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create calendar todo');
  }
};

export const updateCalendarTodo = async (todoId, updates) => {
  try {
    const response = await api.put(`/calendar-todos/${todoId}`, updates);
    return normalizeCalendarTodo(response.data);
  } catch (error) {
    console.error('Update calendar todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update calendar todo');
  }
};

export const deleteCalendarTodo = async (todoId) => {
  try {
    await api.delete(`/calendar-todos/${todoId}`);
  } catch (error) {
    console.error('Delete calendar todo error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete calendar todo');
  }
};

export const getRecurringTodos = async () => {
  try {
    const response = await api.get('/calendar-todos/recurring');
    return response.data.map(normalizeCalendarTodo);
  } catch (error) {
    console.error('Fetch recurring todos error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to load recurring todos');
  }
};
