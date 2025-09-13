// client/src/context/TodoContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const TodoContext = createContext();

// Use environment variables to determine the API base URL
const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Get API base URL
  const API_URL = getBaseUrl();

  // Configure axios with authentication headers
  const getAuthConfig = () => {
    // Only add the auth header if user exists and has a token
    if (user && user.token) {
      return {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
    }
    return {};
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  // Fetch all todos
  const fetchTodos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/todos`, getAuthConfig());
      setTodos(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async (text) => {
    try {
      const response = await axios.post(`${API_URL}/todos`, { text }, getAuthConfig());
      setTodos([response.data, ...todos]);
      return response.data;
    } catch (error) {
      setError('Failed to add todo');
      console.error('Error adding todo:', error);
    }
  };

  // Toggle todo completion status
  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`, { completed }, getAuthConfig());
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed: response.data.completed } : todo
        )
      );
      return response.data;
    } catch (error) {
      setError('Failed to update todo');
      console.error('Error updating todo:', error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`, getAuthConfig());
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoading,
        error,
        addTodo,
        toggleTodo,
        deleteTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};