import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CalendarContext = createContext();

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

export function CalendarProvider({ children }) {
  const [calendarTodos, setCalendarTodos] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [calendarTimeLogs, setCalendarTimeLogs] = useState({});
  const [productivityMetrics, setProductivityMetrics] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const API_URL = getBaseUrl();

  // Fetch calendar todos for date range
  const fetchCalendarTodos = async (startDate, endDate) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const response = await fetch(`${API_URL}/calendar-todos?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar todos: ${response.status}`);
      }
      
      const data = await response.json();
      setCalendarTodos(data);
      
    } catch (err) {
      console.error('Error fetching calendar todos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create calendar todo
  const createCalendarTodo = async (todoData) => {
    if (!user) {
      console.error('User not authenticated for creating todo');
      return null;
    }
    
    console.log('Creating calendar todo with data:', todoData);
    console.log('API URL:', `${API_URL}/calendar-todos`);
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/calendar-todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(todoData),
      });
      
      console.log('Todo creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Todo creation error response:', errorData);
        throw new Error(errorData.message || 'Failed to create todo');
      }
      
      const newTodo = await response.json();
      console.log('Todo created successfully:', newTodo);
      console.log('Current calendarTodos before adding:', calendarTodos);
      setCalendarTodos(prev => {
        const updated = [...prev, newTodo];
        console.log('Updated calendarTodos after adding:', updated);
        return updated;
      });
      
      return newTodo;
    } catch (err) {
      console.error('Error creating calendar todo:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update calendar todo
  const updateCalendarTodo = async (todoId, updates) => {
    console.log('🔄 updateCalendarTodo called with:', { todoId, updates });
    
    if (!user) {
      console.error('❌ No user found, cannot update todo');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Making API request to:', `${API_URL}/calendar-todos/${todoId}`);
      console.log('📤 Request body:', JSON.stringify(updates));
      
      const response = await fetch(`${API_URL}/calendar-todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update todo');
      }
      
      const updatedTodo = await response.json();
      console.log('✅ Updated todo received:', updatedTodo);
      
      setCalendarTodos(prev => {
        const updated = prev.map(todo => todo.id === todoId ? updatedTodo : todo);
        console.log('🔄 Updated todos state:', updated.filter(t => t.id === todoId));
        return updated;
      });
      
      console.log('✅ Todo update completed successfully');
      return updatedTodo;
    } catch (err) {
      console.error('❌ Error updating calendar todo:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete calendar todo
  const deleteCalendarTodo = async (todoId) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/calendar-todos/${todoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete todo');
      }
      
      setCalendarTodos(prev => prev.filter(todo => todo.id !== todoId));
      
      return true;
    } catch (err) {
      console.error('Error deleting calendar todo:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch time logs for a specific date
  const fetchTimeLogs = async (date) => {
    if (!user) return;
    
    console.log('Fetching time logs for date:', date);
    
    setLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      console.log('Date string for time logs query:', dateStr);
      console.log('Time logs API URL:', `${API_URL}/time-logs?date=${dateStr}`);
      
      const response = await fetch(`${API_URL}/time-logs?date=${dateStr}`, {
        credentials: 'include'
      });
      
      console.log('Time logs fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch time logs: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched time logs:', data);
      setTimeLogs(data);

      const dateKey = date.toISOString().split('T')[0];
      setCalendarTimeLogs(prev => ({
        ...prev,
        [dateKey]: data
      }));
      
    } catch (err) {
      console.error('Error fetching time logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeLogsForRange = async (startDate, endDate) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const dateKeys = [];
      const requests = [];

      const cursor = new Date(startDate);
      cursor.setHours(0, 0, 0, 0);

      const final = new Date(endDate);
      final.setHours(23, 59, 59, 999);

      while (cursor <= final) {
        const key = cursor.toISOString().split('T')[0];
        dateKeys.push(key);
        requests.push(
          fetch(`${API_URL}/time-logs?date=${key}`, {
            credentials: 'include'
          })
        );
        cursor.setDate(cursor.getDate() + 1);
      }

      const responses = await Promise.all(requests);
      const aggregated = {};

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const key = dateKeys[i];

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch time logs for ${key}`);
        }

        const logs = await response.json();
        aggregated[key] = logs;
      }

      setCalendarTimeLogs(prev => ({
        ...prev,
        ...aggregated
      }));
    } catch (err) {
      console.error('Error fetching time logs range:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create time log
  const createTimeLog = async (logData) => {
    if (!user) {
      console.error('User not authenticated for creating time log');
      return null;
    }
    
    console.log('Creating time log with data:', logData);
    console.log('API URL:', `${API_URL}/time-logs`);
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/time-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(logData),
      });
      
      console.log('Time log creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Time log creation error response:', errorData);
        throw new Error(errorData.message || 'Failed to create time log');
      }
      
  const newLog = await response.json();
  console.log('Time log created successfully:', newLog);
  setTimeLogs(prev => [...prev, newLog]);

      const logDateSource = newLog.date || newLog.startTime || new Date().toISOString();
      const derivedDate = new Date(logDateSource);
      const dateKey = Number.isNaN(derivedDate.getTime())
        ? new Date().toISOString().split('T')[0]
        : derivedDate.toISOString().split('T')[0];
      setCalendarTimeLogs(prev => {
        const existing = prev[dateKey] || [];
        return {
          ...prev,
          [dateKey]: [...existing, newLog]
        };
      });
      
      return newLog;
    } catch (err) {
      console.error('Error creating time log:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch productivity metrics
  const fetchProductivityMetrics = async (date) => {
    if (!user) return;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/productivity-metrics?date=${dateStr}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch productivity metrics: ${response.status}`);
      }
      
      const data = await response.json();
      setProductivityMetrics(data);
      
    } catch (err) {
      console.error('Error fetching productivity metrics:', err);
      setError(err.message);
    }
  };

  // Get date range based on view mode
  const getDateRange = (date, mode) => {
    const start = new Date(date);
    const end = new Date(date);
    
    switch (mode) {
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'day':
        // Same day
        break;
      default:
        break;
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  // Load data when date or view mode changes
  useEffect(() => {
    console.log('CalendarContext useEffect triggered - User:', !!user, 'SelectedDate:', selectedDate, 'ViewMode:', viewMode);
    if (user && selectedDate) {
      const { start, end } = getDateRange(selectedDate, viewMode);
      console.log('Fetching todos for date range:', start, 'to', end);
      fetchCalendarTodos(start, end);
      
      if (viewMode === 'day') {
        fetchTimeLogs(selectedDate);
        fetchProductivityMetrics(selectedDate);
      } else {
        fetchTimeLogsForRange(start, end);
      }
    }
  }, [user, selectedDate, viewMode]);

  return (
    <CalendarContext.Provider value={{
      calendarTodos,
      timeLogs,
      productivityMetrics,
      selectedDate,
      setSelectedDate,
      viewMode,
      setViewMode,
      loading,
      error,
      fetchCalendarTodos,
      createCalendarTodo,
      updateCalendarTodo,
      deleteCalendarTodo,
      fetchTimeLogs,
      fetchTimeLogsForRange,
      createTimeLog,
      fetchProductivityMetrics,
      getDateRange,
      calendarTimeLogs
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};