import React, { useState, useEffect } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './DiaryPage.css';

const DiaryPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    dailyDiaries,
    fetchDiaryEntry,
    saveDiaryEntry,
    diaryLoading,
    diaryError
  } = useCalendar();
  
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewRange, setViewRange] = useState('week'); // week, month, all

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date) => {
    const check = new Date(date);
    check.setHours(0, 0, 0, 0);
    return check.getTime() === today.getTime();
  };

  const getDateKey = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized.toISOString().split('T')[0];
  };

  const formatDateDisplay = (date) => {
    const d = new Date(date);
    const isToday = d.toDateString() === new Date().toDateString();
    const isYesterday = d.toDateString() === new Date(Date.now() - 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (viewRange) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'all':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return { start, end };
  };

  const getDatesInRange = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(end);
    
    while (current >= start) {
      dates.push(new Date(current));
      current.setDate(current.getDate() - 1);
    }
    
    return dates;
  };

  useEffect(() => {
    const dates = getDatesInRange();
    dates.forEach(date => {
      const key = getDateKey(date);
      if (!dailyDiaries[key]) {
        fetchDiaryEntry(date).catch(() => {});
      }
    });
  }, [viewRange]);

  useEffect(() => {
    if (isToday(selectedDate)) {
      const key = getDateKey(selectedDate);
      const entry = dailyDiaries[key];
      setEditContent(entry?.content || '');
    }
  }, [selectedDate, dailyDiaries]);

  const handleSave = async () => {
    if (!isToday(selectedDate)) return;
    
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveDiaryEntry(selectedDate, editContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save diary:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (isToday(date)) {
      const key = getDateKey(date);
      const entry = dailyDiaries[key];
      setEditContent(entry?.content || '');
    }
  };

  const goToCalendar = (date) => {
    setSelectedDate(date);
    navigate('/calendar');
  };

  const dates = getDatesInRange();
  const selectedKey = getDateKey(selectedDate);
  const selectedEntry = dailyDiaries[selectedKey];
  const canEdit = isToday(selectedDate);

  return (
    <div className={`diary-page ${isDark ? 'dark' : 'light'}`}>
      <div className="diary-header">
        <div className="diary-title-section">
          <h1>Daily Diary</h1>
          <p>Your daily reflections and thoughts</p>
        </div>
        
        <div className="diary-controls">
          <div className="view-range-selector">
            <button
              className={`range-btn ${viewRange === 'week' ? 'active' : ''}`}
              onClick={() => setViewRange('week')}
            >
              Week
            </button>
            <button
              className={`range-btn ${viewRange === 'month' ? 'active' : ''}`}
              onClick={() => setViewRange('month')}
            >
              Month
            </button>
            <button
              className={`range-btn ${viewRange === 'all' ? 'active' : ''}`}
              onClick={() => setViewRange('all')}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {diaryError && <div className="diary-banner error">{diaryError}</div>}
      {saveSuccess && <div className="diary-banner success">Saved successfully!</div>}

      <div className="diary-content">
        <aside className="diary-dates-sidebar">
          <h3>Entries</h3>
          <div className="dates-list">
            {dates.map(date => {
              const key = getDateKey(date);
              const entry = dailyDiaries[key];
              const hasContent = entry?.content && entry.content.trim().length > 0;
              const isTodayDate = isToday(date);
              const isSelected = getDateKey(date) === selectedKey;
              
              return (
                <button
                  key={key}
                  className={`date-item ${isSelected ? 'selected' : ''} ${hasContent ? 'has-content' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="date-label">
                    {formatDateDisplay(date)}
                  </span>
                  {hasContent && <span className="content-indicator">●</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="diary-main">
          <div className="diary-entry-header">
            <div className="entry-date-info">
              <h2>{formatDateDisplay(selectedDate)}</h2>
              <button
                className="view-calendar-btn"
                onClick={() => goToCalendar(selectedDate)}
                title="View this day in calendar"
              >
                View in Calendar →
              </button>
            </div>
            {canEdit && (
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving || diaryLoading}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          <div className="diary-entry-content">
            {canEdit ? (
              <textarea
                className="diary-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="How was your day? What did you learn? What are you grateful for?"
                rows={20}
              />
            ) : (
              <div className="diary-readonly">
                {selectedEntry?.content ? (
                  <p className="diary-text">{selectedEntry.content}</p>
                ) : (
                  <p className="diary-empty">No entry for this day.</p>
                )}
              </div>
            )}
          </div>

          {!canEdit && selectedEntry?.content && (
            <div className="diary-meta">
              <p className="read-only-notice">
                Past entries are read-only. Only today's diary can be edited.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DiaryPage;
