import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './CalendarGrid.css';

const CalendarGrid = ({ selectedDate, viewMode, onDateSelect }) => {
  const { calendarTodos, calendarTimeLogs, loading } = useCalendar();
  const { isDark } = useTheme();

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const isSameDay = (date1, date2) => date1.toDateString() === date2.toDateString();

  const getTodosForDate = (date) => {
    return calendarTodos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return isSameDay(todoDate, date);
    });
  };

  const getTimeLogsForDate = (date) => {
    const key = date.toISOString().split('T')[0];
    return calendarTimeLogs?.[key] ?? [];
  };

  const getProductivityLevel = (todos) => {
    if (todos.length === 0) return 'none';

    const completed = todos.filter(t => t.isCompleted).length;
    const percentage = (completed / todos.length) * 100;

    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const getTimeLabel = (todo) => {
    if (!todo.dueDate) return '';
    const date = new Date(todo.dueDate);
    if (Number.isNaN(date.getTime())) return '';
    if (date.getHours() === 0 && date.getMinutes() === 0) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const getCategoryClass = (category) => {
    if (!category) return 'other';
    return category.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  const formatLogRange = (log) => {
    const start = new Date(log.startTime);
    const end = log.endTime ? new Date(log.endTime) : null;
    if (Number.isNaN(start.getTime())) return '';

    const startLabel = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (!end || Number.isNaN(end.getTime())) {
      return `${startLabel}`;
    }
    const endLabel = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${startLabel} – ${endLabel}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(current);
      const isCurrentMonth = date.getMonth() === month;
      const todos = getTodosForDate(date);
      const logs = getTimeLogsForDate(date);
      const productivityLevel = getProductivityLevel(todos);

      const MAX_VISIBLE = 4;
      const visibleTodos = todos.slice(0, Math.min(todos.length, MAX_VISIBLE));
      const remainingSlots = Math.max(0, MAX_VISIBLE - visibleTodos.length);
      const visibleLogs = remainingSlots > 0 ? logs.slice(0, remainingSlots) : [];
      const totalEntries = todos.length + logs.length;
  const remainingCount = Math.max(0, totalEntries - (visibleTodos.length + visibleLogs.length));

      days.push(
        <div
          key={date.toISOString()}
          className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'}
                     ${isToday(date) ? 'today' : ''}
                     ${isSameDay(date, selectedDate) ? 'selected' : ''}
                     productivity-${productivityLevel}`}
          onClick={() => onDateSelect(date)}
        >
          <div className="day-header-row">
            <div className="day-number">{date.getDate()}</div>
            {totalEntries > 0 && (
              <span className="day-count">{totalEntries}</span>
            )}
          </div>
          {(visibleTodos.length > 0 || visibleLogs.length > 0) && (
            <div className="day-todos">
              {visibleTodos.map(todo => {
                const timeLabel = getTimeLabel(todo);
                return (
                  <div
                    key={`todo-${todo.id}`}
                    className={`day-todo-chip priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                    title={todo.title}
                  >
                    {timeLabel && <span className="chip-time">{timeLabel}</span>}
                    <span className="chip-title">{todo.title}</span>
                  </div>
                );
              })}
              {visibleLogs.map(log => (
                <div
                  key={`log-${log.id}`}
                  className={`day-log-chip category-${getCategoryClass(log.category)}`}
                  title={`${log.activity} (${formatLogRange(log)})`}
                >
                  <span className="chip-time">{formatLogRange(log)}</span>
                  <span className="chip-title">{log.activity}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="more-todos-chip">+{remainingCount} more</div>
              )}
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
            const logs = getTimeLogsForDate(date);
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
                  {todos.slice(0, 4).map(todo => {
                    const timeLabel = getTimeLabel(todo);
                    return (
                      <div
                        key={todo.id}
                        className={`week-todo priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                        title={`${todo.title} - ${todo.completionPercentage}% complete`}
                      >
                        <div className="week-todo-header">
                          {timeLabel && <span className="todo-time">{timeLabel}</span>}
                          <span className="todo-title">{todo.title}</span>
                        </div>
                        <div className="todo-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${todo.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {todos.length > 4 && (
                    <div className="more-todos">+{todos.length - 4} more todos</div>
                  )}
                  {logs.length > 0 && (
                    <div className="week-logs">
                      {logs.slice(0, 3).map(log => (
                        <div key={log.id} className={`week-log category-${getCategoryClass(log.category)}`}>
                          <span className="week-log-time">{formatLogRange(log)}</span>
                          <span className="week-log-title">{log.activity}</span>
                        </div>
                      ))}
                      {logs.length > 3 && (
                        <div className="more-logs">+{logs.length - 3} more logs</div>
                      )}
                    </div>
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
    const timeLogs = getTimeLogsForDate(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const logsByHour = timeLogs.reduce((acc, log) => {
      const start = new Date(log.startTime);
      const hour = start.getHours();
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(log);
      return acc;
    }, {});

    const totalLoggedMinutes = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

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
            <span className="stat">
              <strong>{formatDuration(totalLoggedMinutes)}</strong> logged
            </span>
          </div>
        </div>

        <div className="day-schedule">
          {hours.map(hour => (
            <div key={hour} className="hour-slot">
              <div className="hour-label">
                {hour === 0 ? '12 AM'
                  : hour < 12 ? `${hour} AM`
                  : hour === 12 ? '12 PM'
                  : `${hour - 12} PM`}
              </div>
              <div className="hour-content">
                {logsByHour[hour]?.length ? (
                  logsByHour[hour]
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .map(log => (
                      <div key={log.id} className={`time-log-block category-${getCategoryClass(log.category)}`}>
                        <div className="time-log-range">{formatLogRange(log)}</div>
                        <div className="time-log-activity">{log.activity}</div>
                      </div>
                    ))
                ) : (
                  <div className="time-block-placeholder" />
                )}
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

        <div className="day-time-logs">
          <h3>Time logs</h3>
          {timeLogs.length === 0 ? (
            <div className="no-todos">No time logs for this day</div>
          ) : (
            <div className="time-logs-list">
              {timeLogs
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .map(log => (
                  <div key={log.id} className={`day-log-card category-${getCategoryClass(log.category)}`}>
                    <div className="log-card-header">
                      <span className="log-card-range">{formatLogRange(log)}</span>
                      {log.linkedTodoId && (
                        <span className="log-linked-tag">linked todo</span>
                      )}
                    </div>
                    <div className="log-card-activity">{log.activity}</div>
                    <div className="log-card-meta">
                      <span>{formatDuration(log.duration)}</span>
                      <span className="log-card-category">{log.category}</span>
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