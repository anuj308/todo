import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as todoService from '../services/todoService';

const TodoContext = createContext();

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch todos when user logs in
  useEffect(() => {
    if (user) {
      fetchTodos();
    } else {
      // Clear todos when user logs out
      setTodos([]);
    }
  }, [user]);

  /**
   * Fetch all todos from API
   */
  const fetchTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedTodos = await todoService.getTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      setError(err.message);
      console.error('Fetch todos error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new todo
   */
  const addTodo = async (text) => {
    if (!text.trim()) {
      throw new Error('Todo text cannot be empty');
    }

    setError(null);
    
    try {
      const newTodo = await todoService.createTodo({ text: text.trim() });
      
      // Add to beginning of list (most recent first)
      setTodos([newTodo, ...todos]);
      
      return newTodo;
    } catch (err) {
      setError(err.message);
      console.error('Add todo error:', err);
      throw err;
    }
  };

  /**
   * Toggle todo completion status
   */
  const toggleTodo = async (todoId, completed) => {
    setError(null);
    
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.map(todo => 
      (todo.id === todoId || todo._id === todoId)
        ? { ...todo, completed }
        : todo
    ));
    
    try {
      const updatedTodo = await todoService.toggleTodoCompletion(todoId, completed);
      
      // Update with server response
      setTodos(todos.map(todo =>
        (todo.id === todoId || todo._id === todoId)
          ? updatedTodo
          : todo
      ));
      
      return updatedTodo;
    } catch (err) {
      // Revert optimistic update on error
      setTodos(previousTodos);
      setError(err.message);
      console.error('Toggle todo error:', err);
      throw err;
    }
  };

  /**
   * Update a todo's text
   */
  const updateTodo = async (todoId, updates) => {
    setError(null);
    
    try {
      const updatedTodo = await todoService.updateTodo(todoId, updates);
      
      setTodos(todos.map(todo =>
        (todo.id === todoId || todo._id === todoId)
          ? updatedTodo
          : todo
      ));
      
      return updatedTodo;
    } catch (err) {
      setError(err.message);
      console.error('Update todo error:', err);
      throw err;
    }
  };

  /**
   * Delete a todo
   */
  const deleteTodo = async (todoId) => {
    setError(null);
    
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.filter(todo => 
      todo.id !== todoId && todo._id !== todoId
    ));
    
    try {
      await todoService.deleteTodo(todoId);
    } catch (err) {
      // Revert optimistic update on error
      setTodos(previousTodos);
      setError(err.message);
      console.error('Delete todo error:', err);
      throw err;
    }
  };

  /**
   * Get filtered todos by completion status
   */
  const getFilteredTodos = (filter) => {
    if (filter === 'completed') {
      return todos.filter(todo => todo.completed);
    } else if (filter === 'pending') {
      return todos.filter(todo => !todo.completed);
    }
    return todos; // 'all'
  };

  /**
   * Get todos statistics
   */
  const getTodoStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  };

  const value = {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    getFilteredTodos,
    getTodoStats,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
