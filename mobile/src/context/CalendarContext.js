import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as calendarService from '../services/calendarService';

const CalendarContext = createContext();

const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfMonth = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

const isSameDay = (dateA, dateB) => {
  if (!dateA || !dateB) return false;
  return new Date(dateA).setHours(0, 0, 0, 0) === new Date(dateB).setHours(0, 0, 0, 0);
};

export const CalendarProvider = ({ children }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }

    fetchMonthTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentMonth]);

  const fetchMonthTodos = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const results = await calendarService.getCalendarTodos({ startDate: start, endDate: end });
      setTodos(results);
    } catch (err) {
      setError(err.message);
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const previous = new Date(prev);
      previous.setMonth(previous.getMonth() - 1);
      return startOfMonth(previous);
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return startOfMonth(next);
    });
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    setCurrentMonth(startOfMonth(today));
  };

  const setMonthFromDate = (date) => {
    if (!date) return;
    const normalized = startOfMonth(date);
    setCurrentMonth(normalized);
  };

  const createCalendarTodo = async (payload) => {
    try {
      const todo = await calendarService.createCalendarTodo(payload);
      setTodos((prev) => [...prev, todo]);
      return todo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCalendarTodo = async (todoId, updates) => {
    try {
      const updated = await calendarService.updateCalendarTodo(todoId, updates);
      setTodos((prev) => prev.map((todo) => (todo.id === updated.id ? updated : todo)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCalendarTodo = async (todoId) => {
    try {
      await calendarService.deleteCalendarTodo(todoId);
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getTodosForDate = (date) => {
    return todos.filter((todo) => isSameDay(todo.dueDate, date));
  };

  const monthSummary = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.isCompleted).length;
    return { total, completed, pending: total - completed };
  }, [todos]);

  const value = {
    selectedDate,
    setSelectedDate,
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  setCurrentMonth: setMonthFromDate,
    loading,
    error,
    calendarTodos: todos,
    monthSummary,
    fetchMonthTodos,
    createCalendarTodo,
    updateCalendarTodo,
    deleteCalendarTodo,
    getTodosForDate,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return context;
};
