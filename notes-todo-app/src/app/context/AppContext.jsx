"use client";

import { createContext, useState, useEffect } from 'react';
import { loadNotes, saveNotes, loadTodos, saveTodos } from '@/utils/storage';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  
  useEffect(() => {
    setNotes(loadNotes());
    setTodos(loadTodos());
  }, []);

  const addNote = (content) => {
    const newNote = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  return (
    <AppContext.Provider value={{ 
      notes, 
      addNote, 
      deleteNote, 
      todos, 
      addTodo, 
      toggleTodo, 
      deleteTodo 
    }}>
      {children}
    </AppContext.Provider>
  );
}