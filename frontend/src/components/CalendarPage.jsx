import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import CalendarGrid from './CalendarGrid';
import TodoSidebar from './TodoSidebar';
import TimeLogPanel from './TimeLogPanel';
import ProductivityDashboard from './ProductivityDashboard';
import './CalendarPage.css';

const CalendarPage = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    viewMode, 
    setViewMode,
    loading,
    error 
  } = useCalendar();
  
  const { isDark } = useTheme();
  const [sidebarMode, setSidebarMode] = useState('todos'); // todos, timelog, analytics

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Auto switch to day view when selecting a specific date
    if (viewMode !== 'day') {
      setViewMode('day');
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const formatDateForHeader = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      default:
        break;
    }
    
    setSelectedDate(newDate);
  };

  return (
    <div className={`calendar-page ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h1>Productivity Calendar</h1>
          <p className="selected-date">{formatDateForHeader(selectedDate)}</p>
        </div>
        
        {/* View Mode Switcher */}
        <div className="view-mode-switcher">
          <button 
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('day')}
          >
            Day
          </button>
          <button 
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('week')}
          >
            Week
          </button>
          <button 
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('month')}
          >
            Month
          </button>
        </div>

        {/* Date Navigation */}
        <div className="date-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateDate(-1)}
            title={`Previous ${viewMode}`}
          >
            ←
          </button>
          <button 
            className="today-btn"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
          <button 
            className="nav-btn"
            onClick={() => navigateDate(1)}
            title={`Next ${viewMode}`}
          >
            →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="calendar-content">
        {/* Calendar Grid */}
        <div className="calendar-main">
          <CalendarGrid 
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Sidebar */}
        <div className="calendar-sidebar">
          {/* Sidebar Mode Switcher */}
          <div className="sidebar-tabs">
            <button 
              className={`sidebar-tab ${sidebarMode === 'todos' ? 'active' : ''}`}
              onClick={() => setSidebarMode('todos')}
            >
              📝 Todos
            </button>
            <button 
              className={`sidebar-tab ${sidebarMode === 'timelog' ? 'active' : ''}`}
              onClick={() => setSidebarMode('timelog')}
            >
              ⏰ Time Log
            </button>
            <button 
              className={`sidebar-tab ${sidebarMode === 'analytics' ? 'active' : ''}`}
              onClick={() => setSidebarMode('analytics')}
            >
              📊 Analytics
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content">
            {loading && <div className="loading-spinner">Loading...</div>}
            {error && <div className="error-message">Error: {error}</div>}
            
            {sidebarMode === 'todos' && (
              <TodoSidebar selectedDate={selectedDate} />
            )}
            
            {sidebarMode === 'timelog' && (
              <TimeLogPanel selectedDate={selectedDate} />
            )}
            
            {sidebarMode === 'analytics' && (
              <ProductivityDashboard selectedDate={selectedDate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;