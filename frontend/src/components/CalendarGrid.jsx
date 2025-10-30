import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './CalendarGrid.css';

const CalendarGrid = ({ selectedDate, viewMode, onDateSelect, filterMode = 'all', onEventSelect = () => {} }) => {
  const { calendarTodos, calendarTimeLogs, loading } = useCalendar();
  const { isDark } = useTheme();

  const showTodos = filterMode === 'all' || filterMode === 'todos';
  const showLogs = filterMode === 'all' || filterMode === 'logs';

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

  const hasScheduledTime = (todo) => {
    if (!todo?.dueDate) return false;
    const date = new Date(todo.dueDate);
    if (Number.isNaN(date.getTime())) return false;
    return date.getHours() !== 0 || date.getMinutes() !== 0;
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
    const monthVisibleLimit = filterMode === 'all' ? 4 : 8;
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
  const todos = showTodos ? getTodosForDate(date) : [];
  const logs = showLogs ? getTimeLogsForDate(date) : [];
      const productivityLevel = getProductivityLevel(todos);

  const visibleTodos = todos.slice(0, Math.min(todos.length, monthVisibleLimit));
  const remainingSlots = Math.max(0, monthVisibleLimit - visibleTodos.length);
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onEventSelect('todo', todo);
                    }}
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
                  onClick={(event) => {
                    event.stopPropagation();
                    onEventSelect('log', log);
                  }}
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

    const weekTodoLimit = filterMode === 'all' ? 4 : 8;
    const weekLogLimit = filterMode === 'all' ? 3 : 6;

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
            const todos = showTodos ? getTodosForDate(date) : [];
            const logs = showLogs ? getTimeLogsForDate(date) : [];
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
                  {todos.slice(0, weekTodoLimit).map(todo => {
                    const timeLabel = getTimeLabel(todo);
                    return (
                      <div
                        key={todo.id}
                        className={`week-todo priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                        title={`${todo.title} - ${todo.completionPercentage}% complete`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onEventSelect('todo', todo);
                        }}
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
                  {todos.length > weekTodoLimit && (
                    <div className="more-todos">+{todos.length - weekTodoLimit} more todos</div>
                  )}
                  {logs.length > 0 && (
                    <div className="week-logs">
                      {logs.slice(0, weekLogLimit).map(log => (
                        <div
                          key={log.id}
                          className={`week-log category-${getCategoryClass(log.category)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEventSelect('log', log);
                          }}
                        >
                          <span className="week-log-time">{formatLogRange(log)}</span>
                          <span className="week-log-title">{log.activity}</span>
                        </div>
                      ))}
                      {logs.length > weekLogLimit && (
                        <div className="more-logs">+{logs.length - weekLogLimit} more logs</div>
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
    const todos = showTodos ? getTodosForDate(selectedDate) : [];
  const timeLogs = showLogs ? getTimeLogsForDate(selectedDate) : [];
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

    const scheduledTodos = todos.filter(hasScheduledTime);
    const unscheduledTodos = todos.filter(todo => !hasScheduledTime(todo));

    const todosByHour = scheduledTodos.reduce((acc, todo) => {
      const due = new Date(todo.dueDate);
      const hour = due.getHours();
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(todo);
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
          {showTodos && unscheduledTodos.length > 0 && (
            <div className="hour-slot all-day-slot">
              <div className="hour-label">All day</div>
              <div className="hour-content all-day-content">
                {unscheduledTodos.map(todo => (
                  <div
                    key={todo.id}
                    className={`todo-block priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEventSelect('todo', todo);
                    }}
                  >
                    <div className="todo-block-header">
                      <span className="todo-block-title">{todo.title}</span>
                      <span className="todo-block-badge">No time set</span>
                    </div>
                    {todo.description && (
                      <p className="todo-block-description">{todo.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hours.map(hour => (
            <div key={hour} className="hour-slot">
              <div className="hour-label">
                {hour === 0 ? '12 AM'
                  : hour < 12 ? `${hour} AM`
                  : hour === 12 ? '12 PM'
                  : `${hour - 12} PM`}
              </div>
              <div className="hour-content">
                {(() => {
                  const logsForHour = logsByHour[hour]?.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) || [];
                  const todosForHour = todosByHour[hour]?.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) || [];
                  const hasEntries = todosForHour.length > 0 || logsForHour.length > 0;

                  if (!hasEntries) {
                    return <div className="time-block-placeholder" />;
                  }

                  return (
                    <>
                      {todosForHour.map(todo => (
                        <div
                          key={`todo-${todo.id}`}
                          className={`todo-block priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEventSelect('todo', todo);
                          }}
                        >
                          <div className="todo-block-header">
                            <span className="todo-block-time">{getTimeLabel(todo)}</span>
                            <span className="todo-block-title">{todo.title}</span>
                          </div>
                          {todo.description && (
                            <p className="todo-block-description">{todo.description}</p>
                          )}
                          <div className="todo-block-meta">
                            <span>{todo.completionPercentage}% done</span>
                            {todo.estimatedHours ? <span>{todo.estimatedHours}h est.</span> : null}
                          </div>
                        </div>
                      ))}
                      {logsForHour.map(log => (
                        <div
                          key={`log-${log.id}`}
                          className={`time-log-block category-${getCategoryClass(log.category)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEventSelect('log', log);
                          }}
                        >
                          <div className="time-log-range">{formatLogRange(log)}</div>
                          <div className="time-log-activity">{log.activity}</div>
                        </div>
                      ))}
                    </>
                  );
                })()}
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
                  onClick={(event) => {
                    event.stopPropagation();
                    onEventSelect('todo', todo);
                  }}
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
                  <div
                    key={log.id}
                    className={`day-log-card category-${getCategoryClass(log.category)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEventSelect('log', log);
                    }}
                  >
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