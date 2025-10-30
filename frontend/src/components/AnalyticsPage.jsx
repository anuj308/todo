import React, { useState, useEffect } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const { 
    calendarTodos,
    timeLogs,
    productivityMetrics,
    fetchProductivityMetrics,
    selectedDate,
    setSelectedDate,
    loading 
  } = useCalendar();
  
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [viewPeriod, setViewPeriod] = useState('day'); // day, week, month
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });

  useEffect(() => {
    updateDateRange(viewPeriod);
  }, [viewPeriod, selectedDate]);

  const updateDateRange = (period) => {
    const end = new Date(selectedDate);
    const start = new Date(selectedDate);
    
    if (period === 'week') {
      start.setDate(start.getDate() - 6);
    } else if (period === 'month') {
      start.setMonth(start.getMonth() - 1);
    }
    
    setDateRange({ start, end });
  };

  const getFilteredTodos = () => {
    return calendarTodos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return todoDate >= dateRange.start && todoDate <= dateRange.end;
    });
  };

  const getFilteredTimeLogs = () => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.date || log.startTime);
      return logDate >= dateRange.start && logDate <= dateRange.end;
    });
  };

  const calculateTodoStats = () => {
    const todos = getFilteredTodos();
    const completed = todos.filter(t => t.isCompleted || t.completionPercentage === 100).length;
    const total = todos.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const byPriority = {
      urgent: todos.filter(t => t.priority === 'urgent').length,
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length,
    };

    const byCategory = todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {});

    return { completed, total, completionRate, byPriority, byCategory };
  };

  const calculateTimeLogStats = () => {
    const logs = getFilteredTimeLogs();
    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    
    const byCategory = logs.reduce((acc, log) => {
      const cat = log.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + (log.duration || 0);
      return acc;
    }, {});

    const categoryArray = Object.entries(byCategory).map(([category, duration]) => ({
      category,
      duration,
      hours: Math.floor(duration / 60),
      minutes: duration % 60,
      percentage: totalMinutes > 0 ? Math.round((duration / totalMinutes) * 100) : 0
    })).sort((a, b) => b.duration - a.duration);

    const byDay = logs.reduce((acc, log) => {
      const day = new Date(log.date || log.startTime).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + (log.duration || 0);
      return acc;
    }, {});

    return { 
      totalMinutes, 
      totalHours: Math.floor(totalMinutes / 60),
      categoryArray,
      byDay,
      logsCount: logs.length 
    };
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#8BC34A';
    if (percentage >= 40) return '#FF9800';
    return '#FF5722';
  };

  const todoStats = calculateTodoStats();
  const timeLogStats = calculateTimeLogStats();

  const navigateToCalendar = () => {
    navigate('/calendar');
  };

  return (
    <div className={`analytics-page ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>📊 Analytics Dashboard</h1>
          <p className="header-subtitle">Track your productivity and time management</p>
        </div>
        
        <div className="header-controls">
          <div className="period-selector">
            <button
              className={`period-btn ${viewPeriod === 'day' ? 'active' : ''}`}
              onClick={() => setViewPeriod('day')}
            >
              Day
            </button>
            <button
              className={`period-btn ${viewPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setViewPeriod('week')}
            >
              Week
            </button>
            <button
              className={`period-btn ${viewPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setViewPeriod('month')}
            >
              Month
            </button>
          </div>

          <button className="calendar-link-btn" onClick={navigateToCalendar}>
            View Calendar →
          </button>
        </div>
      </div>

      <div className="date-range-display">
        <span className="date-range-text">
          {viewPeriod === 'day' 
            ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
            : `${dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          }
        </span>
      </div>

      {/* Main Content */}
      <div className="analytics-content">
        {/* Todo Statistics Section */}
        <section className="analytics-section">
          <div className="section-header">
            <h2>✅ Todo Completion</h2>
            <span className="section-count">{todoStats.total} total</span>
          </div>

          <div className="stats-cards">
            <div className="stat-card primary">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{todoStats.completionRate}%</span>
                <span className="stat-label">Completion Rate</span>
              </div>
              <div className="stat-progress">
                <div 
                  className="stat-progress-fill"
                  style={{ 
                    width: `${todoStats.completionRate}%`,
                    backgroundColor: getScoreColor(todoStats.completionRate)
                  }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✔️</div>
              <div className="stat-info">
                <span className="stat-value">{todoStats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-value">{todoStats.total - todoStats.completed}</span>
                <span className="stat-label">Remaining</span>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="breakdown-card">
            <h3>By Priority</h3>
            <div className="breakdown-list">
              {Object.entries(todoStats.byPriority).map(([priority, count]) => (
                <div key={priority} className="breakdown-item">
                  <div className="breakdown-label">
                    <span className={`priority-dot priority-${priority}`}></span>
                    <span className="breakdown-name">{priority}</span>
                  </div>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="breakdown-card">
            <h3>By Category</h3>
            <div className="breakdown-list">
              {Object.entries(todoStats.byCategory).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="breakdown-name">{category}</span>
                  <span className="breakdown-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Time Log Statistics Section */}
        <section className="analytics-section">
          <div className="section-header">
            <h2>⏰ Time Tracking</h2>
            <span className="section-count">{timeLogStats.logsCount} logs</span>
          </div>

          <div className="stats-cards">
            <div className="stat-card primary">
              <div className="stat-icon">🕐</div>
              <div className="stat-info">
                <span className="stat-value">{timeLogStats.totalHours}h</span>
                <span className="stat-label">Total Logged</span>
                <span className="stat-sublabel">{formatTime(timeLogStats.totalMinutes)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">
                  {viewPeriod === 'day' ? timeLogStats.totalHours : Math.round(timeLogStats.totalHours / (viewPeriod === 'week' ? 7 : 30))}h
                </span>
                <span className="stat-label">Daily Average</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <span className="stat-value">{timeLogStats.logsCount}</span>
                <span className="stat-label">Sessions</span>
              </div>
            </div>
          </div>

          {/* Time by Category */}
          <div className="breakdown-card">
            <h3>Time Distribution by Category</h3>
            <div className="category-breakdown">
              {timeLogStats.categoryArray.map(cat => (
                <div key={cat.category} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{cat.category}</span>
                    <span className="category-time">{formatTime(cat.duration)}</span>
                  </div>
                  <div className="category-bar-container">
                    <div 
                      className="category-bar"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <span className="category-percentage">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time by Day (for week/month views) */}
          {viewPeriod !== 'day' && Object.keys(timeLogStats.byDay).length > 0 && (
            <div className="breakdown-card">
              <h3>Time by Day</h3>
              <div className="breakdown-list">
                {Object.entries(timeLogStats.byDay)
                  .sort((a, b) => b[1] - a[1])
                  .map(([day, minutes]) => (
                    <div key={day} className="breakdown-item">
                      <span className="breakdown-name">{day}</span>
                      <span className="breakdown-value">{formatTime(minutes)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* Insights Section */}
        <section className="analytics-section insights-section">
          <div className="section-header">
            <h2>💡 Insights</h2>
          </div>

          <div className="insights-grid">
            {todoStats.completionRate >= 80 && (
              <div className="insight-card success">
                <span className="insight-icon">🎉</span>
                <div className="insight-content">
                  <h4>Excellent Progress!</h4>
                  <p>You're crushing your todos with an {todoStats.completionRate}% completion rate!</p>
                </div>
              </div>
            )}

            {todoStats.completionRate < 50 && todoStats.total > 0 && (
              <div className="insight-card warning">
                <span className="insight-icon">⚠️</span>
                <div className="insight-content">
                  <h4>Completion Rate Low</h4>
                  <p>Try breaking down large tasks into smaller, manageable pieces.</p>
                </div>
              </div>
            )}

            {timeLogStats.totalHours >= 8 && (
              <div className="insight-card success">
                <span className="insight-icon">⭐</span>
                <div className="insight-content">
                  <h4>Great Time Tracking!</h4>
                  <p>You've logged {timeLogStats.totalHours} hours of productive work!</p>
                </div>
              </div>
            )}

            {timeLogStats.totalHours < 4 && viewPeriod === 'day' && (
              <div className="insight-card info">
                <span className="insight-icon">💭</span>
                <div className="insight-content">
                  <h4>Room to Grow</h4>
                  <p>Consider logging more of your daily activities to get better insights.</p>
                </div>
              </div>
            )}

            {todoStats.byPriority.urgent > 5 && (
              <div className="insight-card warning">
                <span className="insight-icon">🔥</span>
                <div className="insight-content">
                  <h4>Too Many Urgent Tasks</h4>
                  <p>You have {todoStats.byPriority.urgent} urgent tasks. Focus on prioritization.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPage;
