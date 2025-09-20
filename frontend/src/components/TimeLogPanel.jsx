import React, { useState, useEffect } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './TimeLogPanel.css';

const TimeLogPanel = ({ selectedDate }) => {
  const { 
    timeLogs, 
    createTimeLog, 
    fetchTimeLogs,
    loading,
    error 
  } = useCalendar();
  
  const { isDark } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    category: 'work',
    subcategory: '',
    activity: '',
    productivity: 3,
    mood: 3,
    energy: 3,
    notes: '',
    isPlanned: false
  });

  const categories = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'exercise', label: 'Exercise', icon: '🏃' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'meal', label: 'Meal', icon: '🍽️' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'commute', label: 'Commute', icon: '🚗' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'chores', label: 'Chores', icon: '🧹' },
    { value: 'break', label: 'Break', icon: '☕' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  useEffect(() => {
    console.log('TimeLogPanel useEffect - selectedDate changed:', selectedDate);
    console.log('Current timeLogs state:', timeLogs);
    if (selectedDate) {
      fetchTimeLogs(selectedDate);
    }
  }, [selectedDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.startTime || !formData.endTime || !formData.activity.trim()) {
      setLocalError('Please fill in all required fields');
      return;
    }

    // Create proper Date objects using the selected date
    // Use the selected date but only take the date part (YYYY-MM-DD)
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
    console.log('Selected date components:', { year, month, day });
    console.log('Start time input:', formData.startTime);
    console.log('End time input:', formData.endTime);
    
    // Parse time strings (HH:MM format)
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    // Create dates using the selected date but with specified times
    const startDateTime = new Date(year, month, day, startHours, startMinutes, 0);
    const endDateTime = new Date(year, month, day, endHours, endMinutes, 0);
    
    console.log('Created start date:', startDateTime);
    console.log('Created end date:', endDateTime);

    // Validate time range
    if (endDateTime <= startDateTime) {
      setLocalError('End time must be after start time');
      return;
    }

    // Calculate duration manually to ensure it's correct
    const durationMinutes = Math.round((endDateTime - startDateTime) / (1000 * 60));
    console.log('Calculated duration:', durationMinutes, 'minutes');

    // Use the same date for the log date (without time component)
    const logDate = new Date(year, month, day, 0, 0, 0, 0);

    const logData = {
      date: logDate,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: durationMinutes,
      category: formData.category,
      subcategory: formData.subcategory,
      activity: formData.activity.trim(),
      productivity: parseInt(formData.productivity),
      mood: parseInt(formData.mood),
      energy: parseInt(formData.energy),
      notes: formData.notes.trim(),
      isPlanned: formData.isPlanned
    };

    console.log('Final log data being sent:', logData);

    setLocalError(null);
    const success = await createTimeLog(logData);
    
    if (success) {
      resetForm();
      // Refetch time logs to ensure consistency
      fetchTimeLogs(selectedDate);
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      category: 'work',
      subcategory: '',
      activity: '',
      productivity: 3,
      mood: 3,
      energy: 3,
      notes: '',
      isPlanned: false
    });
    setShowForm(false);
    setLocalError(null);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📝';
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#4CAF50';
    if (score >= 3) return '#FF9800';
    return '#F44336';
  };

  const totalLoggedTime = timeLogs.reduce((sum, log) => sum + log.duration, 0);

  console.log('TimeLogPanel render - timeLogs:', timeLogs);
  console.log('TimeLogPanel render - timeLogs.length:', timeLogs.length);
  console.log('TimeLogPanel render - loading:', loading);

  return (
    <div className={`time-log-panel ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="panel-header">
        <h3>
          Time Log - {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          })}
        </h3>
        <button 
          className="add-log-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {/* Daily Summary */}
      <div className="daily-summary">
        <div className="summary-stat">
          <span className="stat-value">{formatDuration(totalLoggedTime)}</span>
          <span className="stat-label">Total Logged</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{timeLogs.length}</span>
          <span className="stat-label">Activities</span>
        </div>
      </div>

      {/* Error Message */}
      {(error || localError) && (
        <div className="error-message">
          {localError || error}
        </div>
      )}

      {/* Add Time Log Form */}
      {showForm && (
        <form className="time-log-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Activity Description</label>
            <input
              type="text"
              name="activity"
              value={formData.activity}
              onChange={handleInputChange}
              placeholder="What did you do?"
              required
            />
          </div>

          <div className="form-group">
            <label>Subcategory (optional)</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              placeholder="e.g., Meeting, Coding, Reading..."
            />
          </div>

          <div className="rating-group">
            <div className="rating-item">
              <label>Productivity (1-5)</label>
              <input
                type="range"
                name="productivity"
                value={formData.productivity}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
              />
              <span className="rating-value">{formData.productivity}</span>
            </div>

            <div className="rating-item">
              <label>Mood (1-5)</label>
              <input
                type="range"
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
              />
              <span className="rating-value">{formData.mood}</span>
            </div>

            <div className="rating-item">
              <label>Energy (1-5)</label>
              <input
                type="range"
                name="energy"
                value={formData.energy}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
              />
              <span className="rating-value">{formData.energy}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPlanned"
                checked={formData.isPlanned}
                onChange={handleInputChange}
              />
              This was planned ahead
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Add Time Log'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Time Logs List */}
      <div className="time-logs-list">
        {loading && <div className="loading">Loading time logs...</div>}
        
        {timeLogs.length === 0 && !loading ? (
          <div className="no-logs">
            <p>No time logs for this date</p>
            <button 
              className="add-first-log"
              onClick={() => setShowForm(true)}
            >
              Add your first time log
            </button>
          </div>
        ) : (
          <div className="logs-container">
            {timeLogs
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map(log => (
                <div key={log.id} className="time-log-item">
                  <div className="log-header">
                    <div className="log-time">
                      <span className="category-icon">{getCategoryIcon(log.category)}</span>
                      <span className="time-range">
                        {formatTime(log.startTime)} - {formatTime(log.endTime)}
                      </span>
                      <span className="duration">{formatDuration(log.duration)}</span>
                    </div>
                    <div className="log-category">{log.category}</div>
                  </div>

                  <div className="log-activity">
                    <strong>{log.activity}</strong>
                    {log.subcategory && (
                      <span className="subcategory"> • {log.subcategory}</span>
                    )}
                  </div>

                  {log.notes && (
                    <div className="log-notes">{log.notes}</div>
                  )}

                  <div className="log-ratings">
                    <div className="rating" style={{ color: getScoreColor(log.productivity) }}>
                      📈 {log.productivity}/5
                    </div>
                    <div className="rating" style={{ color: getScoreColor(log.mood) }}>
                      😊 {log.mood}/5
                    </div>
                    <div className="rating" style={{ color: getScoreColor(log.energy) }}>
                      ⚡ {log.energy}/5
                    </div>
                    {log.isPlanned && (
                      <div className="planned-indicator">📋 Planned</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeLogPanel;