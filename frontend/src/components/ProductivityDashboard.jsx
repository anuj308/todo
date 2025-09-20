import React, { useState, useEffect } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './ProductivityDashboard.css';

const ProductivityDashboard = ({ selectedDate }) => {
  const { 
    productivityMetrics, 
    fetchProductivityMetrics,
    loading,
    error 
  } = useCalendar();
  
  const { isDark } = useTheme();
  const [viewPeriod, setViewPeriod] = useState('day'); // day, week, month

  useEffect(() => {
    if (selectedDate) {
      fetchProductivityMetrics(selectedDate);
    }
  }, [selectedDate]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FF9800';
    if (score >= 20) return '#FF5722';
    return '#F44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Below Average';
    return 'Needs Improvement';
  };

  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const renderCircularProgress = (percentage, label, color) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--progress-bg)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fill="var(--text-color)"
            fontSize="16"
            fontWeight="bold"
          >
            {Math.round(percentage)}%
          </text>
          <text
            x="50"
            y="60"
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="10"
          >
            {label}
          </text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!productivityMetrics) {
    return (
      <div className="no-metrics">
        <p>No productivity data available for this date.</p>
        <p className="suggestion">Start logging time and completing todos to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className={`productivity-dashboard ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="dashboard-header">
        <h3>
          Analytics - {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          })}
        </h3>
        <div className="view-switcher">
          <button 
            className={`view-btn ${viewPeriod === 'day' ? 'active' : ''}`}
            onClick={() => setViewPeriod('day')}
          >
            Day
          </button>
          <button 
            className={`view-btn ${viewPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setViewPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`view-btn ${viewPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setViewPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="overall-score">
        <div className="score-container">
          {renderCircularProgress(
            productivityMetrics.productivityScore || 0,
            'Overall',
            getScoreColor(productivityMetrics.productivityScore || 0)
          )}
          <div className="score-details">
            <h4>Productivity Score</h4>
            <p className="score-label">
              {getScoreLabel(productivityMetrics.productivityScore || 0)}
            </p>
            {productivityMetrics.goalAchieved && (
              <div className="goal-achieved">🎯 Goal Achieved!</div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <span className="metric-value">
              {productivityMetrics.completedTodos || 0}/{productivityMetrics.totalTodos || 0}
            </span>
            <span className="metric-label">Todos Completed</span>
            <div className="metric-bar">
              <div 
                className="metric-fill"
                style={{ 
                  width: `${productivityMetrics.todoCompletionRate || 0}%`,
                  backgroundColor: getScoreColor(productivityMetrics.todoCompletionRate || 0)
                }}
              />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <span className="metric-value">
              {formatHours(productivityMetrics.productiveTime || 0)}
            </span>
            <span className="metric-label">Productive Time</span>
            <div className="metric-subtext">
              of {formatHours((productivityMetrics.dailyGoal || 8) * 60)} goal
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <span className="metric-value">
              {formatHours(productivityMetrics.totalTimeLogged || 0)}
            </span>
            <span className="metric-label">Total Logged</span>
            <div className="metric-subtext">
              across all activities
            </div>
          </div>
        </div>
      </div>

      {/* Mood & Energy */}
      <div className="mood-energy">
        <div className="rating-card">
          <h4>Daily Averages</h4>
          <div className="rating-grid">
            <div className="rating-item">
              <span className="rating-label">😊 Mood</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    className={`star ${star <= (productivityMetrics.avgMood || 0) ? 'filled' : ''}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-value">{(productivityMetrics.avgMood || 0).toFixed(1)}</span>
            </div>

            <div className="rating-item">
              <span className="rating-label">⚡ Energy</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    className={`star ${star <= (productivityMetrics.avgEnergy || 0) ? 'filled' : ''}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-value">{(productivityMetrics.avgEnergy || 0).toFixed(1)}</span>
            </div>

            <div className="rating-item">
              <span className="rating-label">📈 Productivity</span>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    className={`star ${star <= (productivityMetrics.avgProductivity || 0) ? 'filled' : ''}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="rating-value">{(productivityMetrics.avgProductivity || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Breakdown */}
      {productivityMetrics.categoryBreakdown && productivityMetrics.categoryBreakdown.length > 0 && (
        <div className="time-breakdown">
          <h4>Time Distribution</h4>
          <div className="category-list">
            {productivityMetrics.categoryBreakdown
              .sort((a, b) => b.duration - a.duration)
              .map(category => (
                <div key={category.category} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.category}</span>
                    <span className="category-time">{formatHours(category.duration)}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="category-percentage">{category.percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Streak Info */}
      {productivityMetrics.streakDays > 0 && (
        <div className="streak-info">
          <div className="streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-content">
              <span className="streak-number">{productivityMetrics.streakDays}</span>
              <span className="streak-label">Day Streak</span>
              <p className="streak-description">
                Keep it up! You're on a roll with achieving your daily goals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="insights">
        <h4>💡 Insights</h4>
        <div className="insight-list">
          {productivityMetrics.todoCompletionRate < 50 && (
            <div className="insight-item warning">
              Consider breaking down large todos into smaller, manageable tasks.
            </div>
          )}
          {productivityMetrics.avgEnergy < 3 && (
            <div className="insight-item warning">
              Your energy levels seem low. Consider taking more breaks or getting better sleep.
            </div>
          )}
          {productivityMetrics.productiveTime < (productivityMetrics.dailyGoal * 60 * 0.8) && (
            <div className="insight-item info">
              You're close to your daily goal! Consider time-blocking to stay focused.
            </div>
          )}
          {productivityMetrics.productivityScore >= 80 && (
            <div className="insight-item success">
              Excellent productivity today! Your consistent effort is paying off.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;