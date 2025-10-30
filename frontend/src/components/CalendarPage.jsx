import React, { useEffect, useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import CalendarGrid from './CalendarGrid';
import Modal from './Modal';
import './CalendarPage.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'todos', label: 'Todos' },
  { id: 'logs', label: 'Time Logs' }
];

const defaultTodoForm = (date) => ({
  title: '',
  description: '',
  dueDate: formatDateInput(date),
  dueTime: '',
  priority: 'medium',
  category: 'today',
  timeCategory: 'personal',
  estimatedHours: '1'
});

const defaultTimeLogForm = (date) => ({
  activity: '',
  start: formatDateTimeInput(date, '09:00'),
  end: formatDateTimeInput(date, '10:00'),
  category: 'deepwork',
  notes: ''
});

function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTimeInput(date, timeFallback = '09:00') {
  if (!date) return '';
  const base = new Date(date);
  const isoDate = formatDateInput(base);
  return `${isoDate}T${timeFallback}`;
}

function getDateKey(date) {
  if (!date) return '';
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized.toISOString().split('T')[0];
}

function formatDurationLabel(minutes) {
  if (!minutes) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
}

const CalendarPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    loading,
    error,
    createCalendarTodo,
    createTimeLog,
    updateCalendarTodo,
    dailyDiaries,
    fetchDiaryEntry,
    saveDiaryEntry,
    diaryLoading,
    diaryError
  } = useCalendar();

  const { isDark } = useTheme();
  const [filterMode, setFilterMode] = useState('all');
  const [createModalType, setCreateModalType] = useState(null); // 'todo' | 'log' | null
  const [selectedEvent, setSelectedEvent] = useState(null); // { type: 'todo' | 'log', data }
  const [todoForm, setTodoForm] = useState(() => defaultTodoForm(new Date()));
  const [logForm, setLogForm] = useState(() => defaultTimeLogForm(new Date()));
  const [todoSaving, setTodoSaving] = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [todoProgress, setTodoProgress] = useState(0);
  const [diaryModalOpen, setDiaryModalOpen] = useState(false);
  const [diaryContent, setDiaryContent] = useState('');
  const [diarySaving, setDiarySaving] = useState(false);
  const [diaryAlert, setDiaryAlert] = useState(null);

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

  useEffect(() => {
    if (createModalType === 'todo') {
      setTodoForm(defaultTodoForm(selectedDate));
    }
    if (createModalType === 'log') {
      setLogForm(defaultTimeLogForm(selectedDate));
    }
  }, [createModalType, selectedDate]);

  useEffect(() => {
    if (selectedEvent?.type === 'todo') {
      setTodoProgress(selectedEvent.data.completionPercentage ?? 0);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (!diaryModalOpen) return;

    let isActive = true;

    const loadDiary = async () => {
      try {
        const entry = await fetchDiaryEntry(selectedDate);
        if (isActive) {
          setDiaryContent(entry?.content || '');
          setDiaryAlert(null);
        }
      } catch (err) {
        if (isActive) {
          setDiaryAlert(err.message);
        }
      }
    };

    loadDiary();

    return () => {
      isActive = false;
    };
  }, [diaryModalOpen, selectedDate, fetchDiaryEntry]);

  const handleTodoFormChange = (event) => {
    const { name, value } = event.target;
    setTodoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogFormChange = (event) => {
    const { name, value } = event.target;
    setLogForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTodo = async (event) => {
    event.preventDefault();
    setTodoSaving(true);
    try {
      const dueDateString = todoForm.dueDate ? `${todoForm.dueDate}T${todoForm.dueTime || '00:00'}` : null;
      const dueDate = dueDateString ? new Date(dueDateString) : selectedDate;
      const payload = {
        title: todoForm.title.trim(),
        description: todoForm.description.trim(),
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority: todoForm.priority,
        category: todoForm.category,
        timeCategory: todoForm.timeCategory,
        estimatedHours: Number.parseFloat(todoForm.estimatedHours) || 0,
        completionPercentage: 0,
        isCompleted: false
      };

      const created = await createCalendarTodo(payload);
      if (created) {
        setCreateModalType(null);
      }
    } finally {
      setTodoSaving(false);
    }
  };

  const handleCreateLog = async (event) => {
    event.preventDefault();
    setLogSaving(true);
    try {
      const startDate = logForm.start ? new Date(logForm.start) : null;
      const endDate = logForm.end ? new Date(logForm.end) : null;

      const startISO = startDate && !Number.isNaN(startDate.getTime())
        ? startDate.toISOString()
        : null;
      const endISO = endDate && !Number.isNaN(endDate.getTime())
        ? endDate.toISOString()
        : null;

      let dateISO = null;
      if (startDate && !Number.isNaN(startDate.getTime())) {
        const normalized = new Date(startDate);
        normalized.setUTCHours(0, 0, 0, 0);
        dateISO = normalized.toISOString();
      } else if (selectedDate) {
        const normalized = new Date(selectedDate);
        normalized.setUTCHours(0, 0, 0, 0);
        dateISO = normalized.toISOString();
      }

      const payload = {
        activity: logForm.activity.trim(),
        startTime: startISO,
        endTime: endISO,
        category: logForm.category,
        notes: logForm.notes.trim(),
        date: dateISO
      };

      const created = await createTimeLog(payload);
      if (created) {
        setCreateModalType(null);
      }
    } finally {
      setLogSaving(false);
    }
  };

  const handleProgressSave = async () => {
    if (!selectedEvent || selectedEvent.type !== 'todo') return;
    setDetailSaving(true);
    try {
      const updates = {
        completionPercentage: todoProgress,
        isCompleted: todoProgress === 100
      };
      const updated = await updateCalendarTodo(selectedEvent.data.id, updates);
      if (updated) {
        setSelectedEvent({ type: 'todo', data: updated });
      }
    } finally {
      setDetailSaving(false);
    }
  };

  const handleEventSelect = (type, data) => {
    setSelectedEvent({ type, data });
  };

  const closeDetailModal = () => {
    setSelectedEvent(null);
    setTodoProgress(0);
  };

  const handleOpenDiary = () => {
    setDiaryAlert(null);
    setDiaryContent('');
    setDiaryModalOpen(true);
  };

  const handleDiarySave = async () => {
    setDiarySaving(true);
    setDiaryAlert(null);
    try {
      await saveDiaryEntry(selectedDate, diaryContent);
      setDiaryModalOpen(false);
    } catch (err) {
      setDiaryAlert(err.message);
    } finally {
      setDiarySaving(false);
    }
  };

  const closeDiaryModal = () => {
    setDiaryModalOpen(false);
    setDiaryAlert(null);
  };

  const renderCreateTodoModal = () => {
    if (createModalType !== 'todo') return null;
    return (
      <Modal title="Add Todo" onClose={() => setCreateModalType(null)}>
        <form className="quick-form" onSubmit={handleCreateTodo}>
          <div className="form-row">
            <label>
              Title
              <input
                name="title"
                value={todoForm.title}
                onChange={handleTodoFormChange}
                required
                placeholder="What needs attention?"
              />
            </label>
            <label>
              Due date
              <input
                type="date"
                name="dueDate"
                value={todoForm.dueDate}
                onChange={handleTodoFormChange}
              />
            </label>
            <label>
              Due time
              <input
                type="time"
                name="dueTime"
                value={todoForm.dueTime}
                onChange={handleTodoFormChange}
              />
            </label>
          </div>

          <label className="stack-field">
            Description
            <textarea
              name="description"
              value={todoForm.description}
              onChange={handleTodoFormChange}
              rows={3}
              placeholder="Add context"
            />
          </label>

          <div className="form-row">
            <label>
              Priority
              <select name="priority" value={todoForm.priority} onChange={handleTodoFormChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label>
              Category
              <select name="category" value={todoForm.category} onChange={handleTodoFormChange}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="someday">Someday</option>
              </select>
            </label>
            <label>
              Time category
              <select name="timeCategory" value={todoForm.timeCategory} onChange={handleTodoFormChange}>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="social">Social</option>
                <option value="hobby">Hobby</option>
                <option value="shopping">Shopping</option>
                <option value="chores">Chores</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Estimated hours
              <input
                type="number"
                min="0"
                step="0.5"
                name="estimatedHours"
                value={todoForm.estimatedHours}
                onChange={handleTodoFormChange}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={() => setCreateModalType(null)}>
              Cancel
            </button>
            <button type="submit" disabled={todoSaving}>
              {todoSaving ? 'Saving…' : 'Create todo'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const renderCreateLogModal = () => {
    if (createModalType !== 'log') return null;
    return (
      <Modal title="Add Time Log" onClose={() => setCreateModalType(null)}>
        <form className="quick-form" onSubmit={handleCreateLog}>
          <div className="form-row">
            <label>
              Activity
              <input
                name="activity"
                value={logForm.activity}
                onChange={handleLogFormChange}
                required
                placeholder="What did you work on?"
              />
            </label>
            <label>
              Category
              <select name="category" value={logForm.category} onChange={handleLogFormChange}>
                <option value="deepwork">Deep work</option>
                <option value="work">Work session</option>
                <option value="meeting">Meeting</option>
                <option value="learning">Learning</option>
                <option value="study">Study</option>
                <option value="break">Break</option>
                <option value="exercise">Exercise</option>
                <option value="personal">Personal</option>
                <option value="social">Social</option>
                <option value="chores">Chores</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Start
              <input
                type="datetime-local"
                name="start"
                value={logForm.start}
                onChange={handleLogFormChange}
                required
              />
            </label>
            <label>
              End
              <input
                type="datetime-local"
                name="end"
                value={logForm.end}
                onChange={handleLogFormChange}
                required
              />
            </label>
          </div>

          <label className="stack-field">
            Notes
            <textarea
              name="notes"
              value={logForm.notes}
              onChange={handleLogFormChange}
              rows={3}
              placeholder="Optional notes"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={() => setCreateModalType(null)}>
              Cancel
            </button>
            <button type="submit" disabled={logSaving}>
              {logSaving ? 'Saving…' : 'Create log'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  const renderDetailModal = () => {
    if (!selectedEvent) return null;
    const { type, data } = selectedEvent;
    const title = type === 'todo' ? 'Todo details' : 'Time log details';

    return (
      <Modal title={title} onClose={closeDetailModal}>
        {type === 'todo' ? (
          <div className="detail-view">
            <header className="detail-header">
              <h3>{data.title}</h3>
              <span className={`badge priority-${data.priority}`}>{data.priority}</span>
            </header>
            <dl className="detail-grid">
              <div>
                <dt>Due date</dt>
                <dd>{data.dueDate ? new Date(data.dueDate).toLocaleString() : 'Not set'}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{data.category}</dd>
              </div>
              <div>
                <dt>Time bucket</dt>
                <dd>{data.timeCategory}</dd>
              </div>
              <div>
                <dt>Estimated hours</dt>
                <dd>{data.estimatedHours ?? 0}</dd>
              </div>
            </dl>
            {data.description && (
              <section className="detail-section">
                <h4>Description</h4>
                <p>{data.description}</p>
              </section>
            )}

            <section className="detail-section">
              <h4>Completion</h4>
              <div className="progress-input">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={todoProgress}
                  onChange={(event) => setTodoProgress(Number.parseInt(event.target.value, 10))}
                />
                <span>{todoProgress}%</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setTodoProgress(0)}>
                  Reset
                </button>
                <button type="button" className="secondary" onClick={() => setTodoProgress(100)}>
                  Mark complete
                </button>
                <button type="button" onClick={handleProgressSave} disabled={detailSaving}>
                  {detailSaving ? 'Saving…' : 'Save progress'}
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="detail-view">
            <header className="detail-header">
              <h3>{data.activity}</h3>
              <span className={`badge category-${data.category}`}>{data.category}</span>
            </header>
            <dl className="detail-grid">
              <div>
                <dt>Start</dt>
                <dd>{data.startTime ? new Date(data.startTime).toLocaleString() : 'Not recorded'}</dd>
              </div>
              <div>
                <dt>End</dt>
                <dd>{data.endTime ? new Date(data.endTime).toLocaleString() : 'Open ended'}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatDurationLabel(data.duration)}</dd>
              </div>
              {data.linkedTodoId && (
                <div>
                  <dt>Linked todo</dt>
                  <dd>{data.linkedTodoId}</dd>
                </div>
              )}
            </dl>
            {data.notes && (
              <section className="detail-section">
                <h4>Notes</h4>
                <p>{data.notes}</p>
              </section>
            )}
            <div className="modal-actions single">
              <button type="button" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    );
  };

  return (
    <div className={`calendar-page ${isDark ? 'dark' : 'light'}`}>
      <div className="calendar-header">
        <div className="calendar-title">
          <h1>Productivity Calendar</h1>
          <p className="selected-date">{formatDateForHeader(selectedDate)}</p>
        </div>

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

        <div className="date-navigation">
          <button
            className="nav-btn"
            onClick={() => navigateDate(-1)}
            title={`Previous ${viewMode}`}
          >
            ←
          </button>
          <button className="today-btn" onClick={() => setSelectedDate(new Date())}>
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

      <div className="calendar-actions">
        <div className="filter-group" role="group" aria-label="Calendar filter">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`filter-btn ${filterMode === option.id ? 'active' : ''}`}
              onClick={() => setFilterMode(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="quick-actions">
          <button className="quick-btn" onClick={() => setCreateModalType('todo')}>
            + Add Todo
          </button>
          <button className="quick-btn" onClick={() => setCreateModalType('log')}>
            + Add Time Log
          </button>
          <button className="quick-btn secondary" onClick={handleOpenDiary}>
            Daily Diary
          </button>
        </div>
      </div>

      {loading && <div className="banner loading">Loading…</div>}
      {(error || diaryError) && (
        <div className="banner error">{error || diaryError}</div>
      )}

      <div className="calendar-main">
        <CalendarGrid
          selectedDate={selectedDate}
          viewMode={viewMode}
          onDateSelect={handleDateSelect}
          filterMode={filterMode}
          onEventSelect={handleEventSelect}
        />

        {viewMode === 'day' && (
          <section className="day-diary-card">
            <header className="day-diary-header">
              <div>
                <h2>Daily diary</h2>
                <p>Capture how the day felt, wins, lessons, anything.</p>
              </div>
              <button className="quick-btn secondary" onClick={handleOpenDiary}>
                {diaryLoading ? 'Loading…' : 'Open diary'}
              </button>
            </header>
            <div className="day-diary-body">
              {(() => {
                const entryKey = getDateKey(selectedDate);
                const entry = dailyDiaries?.[entryKey];
                if (entry?.content) {
                  return <p>{entry.content.slice(0, 400)}{entry.content.length > 400 ? '…' : ''}</p>;
                }
                return <p className="diary-placeholder">No notes yet for this day.</p>;
              })()}
            </div>
          </section>
        )}
      </div>

      {renderCreateTodoModal()}
      {renderCreateLogModal()}
      {renderDetailModal()}
      {diaryModalOpen && (
        <Modal title={`Daily Diary — ${formatDateForHeader(selectedDate)}`} onClose={closeDiaryModal}>
          <div className="diary-modal">
            <textarea
              value={diaryContent}
              onChange={(event) => setDiaryContent(event.target.value)}
              rows={12}
              placeholder="How did today go? What do you want to remember?"
            />
            {diaryAlert && <div className="diary-alert">{diaryAlert}</div>}
            <div className="modal-actions">
              <button type="button" className="secondary" onClick={closeDiaryModal}>
                Cancel
              </button>
              <button type="button" onClick={handleDiarySave} disabled={diarySaving}>
                {diarySaving ? 'Saving…' : 'Save entry'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;