import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './CalendarGrid.css';

const CalendarGrid = ({ selectedDate, viewMode, onDateSelect }) => {
  const { calendarTodos, loading } = useCalendar();
  const { isDark } = useTheme();

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getTodosForDate = (date) => {
    return calendarTodos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return isSameDay(todoDate, date);
    });
  };

  const getProductivityLevel = (todos) => {
    if (todos.length === 0) return 'none';
    
    const completed = todos.filter(t => t.isCompleted).length;
    const percentage = (completed / todos.length) * 100;
    
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Get first day of month and calculate calendar grid
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      const isCurrentMonth = date.getMonth() === month;
      const todos = getTodosForDate(date);
      const productivityLevel = getProductivityLevel(todos);
      
      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} 
                     ${isToday(date) ? 'today' : ''} 
                     ${isSameDay(date, selectedDate) ? 'selected' : ''}
                     productivity-${productivityLevel}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="day-number">{date.getDate()}</div>
          {todos.length > 0 && (
            <div className="day-todos">
              <div className="todo-count">{todos.length}</div>
              <div className="todo-indicators">
                {todos.slice(0, 3).map(todo => (
                  <div
                    key={todo.id}
                    className={`todo-indicator priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                    title={todo.title}
                  />
                ))}
                {todos.length > 3 && <div className="more-todos">+{todos.length - 3}</div>}
              </div>
            </div>
          )}
        </div>
      );
      
      current.setDate(current.getDate() + 1);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="month-view">
        <div className="month-header">
          <h2>{monthNames[month]} {year}</h2>
        </div>
        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days-grid">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="week-view">
        <div className="week-header">
          <h2>
            Week of {startOfWeek.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </h2>
        </div>
        <div className="week-days">
          {weekDays.map(date => {
            const todos = getTodosForDate(date);
            const productivityLevel = getProductivityLevel(todos);
            
            return (
              <div
                key={date.toISOString()}
                className={`week-day ${isToday(date) ? 'today' : ''} 
                           ${isSameDay(date, selectedDate) ? 'selected' : ''}
                           productivity-${productivityLevel}`}
                onClick={() => onDateSelect(date)}
              >
                <div className="week-day-header">
                  <div className="day-name">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="day-number">{date.getDate()}</div>
                </div>
                <div className="week-day-content">
                  {todos.slice(0, 5).map(todo => (
                    <div
                      key={todo.id}
                      className={`week-todo priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                      title={`${todo.title} - ${todo.completionPercentage}% complete`}
                    >
                      <div className="todo-title">{todo.title}</div>
                      <div className="todo-progress">
                        <div 
                          className="progress-bar"
                          style={{ width: `${todo.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {todos.length > 5 && (
                    <div className="more-todos">+{todos.length - 5} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const todos = getTodosForDate(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="day-view">
        <div className="day-header">
          <h2>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </h2>
          <div className="day-stats">
            <span className="stat">
              <strong>{todos.length}</strong> todos
            </span>
            <span className="stat">
              <strong>{todos.filter(t => t.isCompleted).length}</strong> completed
            </span>
            <span className="stat">
              <strong>
                {todos.length > 0 
                  ? Math.round((todos.filter(t => t.isCompleted).length / todos.length) * 100)
                  : 0}%
              </strong> done
            </span>
          </div>
        </div>
        
        <div className="day-schedule">
          {hours.map(hour => (
            <div key={hour} className="hour-slot">
              <div className="hour-label">
                {hour === 0 ? '12 AM' : 
                 hour < 12 ? `${hour} AM` : 
                 hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="hour-content">
                {/* This will be populated with time blocks in a future update */}
                <div className="time-block-placeholder">
                  {/* Planned activities will appear here */}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="day-todos">
          <h3>Todos for this day</h3>
          {todos.length === 0 ? (
            <div className="no-todos">No todos scheduled for this day</div>
          ) : (
            <div className="todos-list">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={`day-todo priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                >
                  <div className="todo-header">
                    <h4 className="todo-title">{todo.title}</h4>
                    <span className="todo-category">{todo.category}</span>
                  </div>
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                  <div className="todo-footer">
                    <div className="todo-progress">
                      <span className="progress-text">{todo.completionPercentage}% complete</span>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar"
                          style={{ width: `${todo.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="todo-meta">
                      <span className="todo-time">{todo.estimatedHours}h estimated</span>
                      {todo.actualHours > 0 && (
                        <span className="todo-actual">{todo.actualHours}h actual</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className={`calendar-grid ${isDark ? 'dark' : 'light'}`}>
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarGrid;