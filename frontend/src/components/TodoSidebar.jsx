import React, { useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { useTheme } from '../context/ThemeContext';
import './TodoSidebar.css';

const TodoSidebar = ({ selectedDate }) => {
  const { 
    calendarTodos, 
    createCalendarTodo, 
    updateCalendarTodo, 
    deleteCalendarTodo,
    fetchCalendarTodos,
    loading,
    error 
  } = useCalendar();
  
  const { isDark } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'today',
    timeCategory: 'personal',
    estimatedHours: 1,
    completionPercentage: 0
  });

  const isSameDay = (date1, date2) => {
    // Compare just the date parts, ignoring time
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() === d2.getTime();
  };

  const todaysDate = selectedDate.toISOString().split('T')[0];
  
  // Filter todos for selected date
  const todaysTodos = calendarTodos.filter(todo => {
    const todoDate = new Date(todo.dueDate);
    const matches = isSameDay(todoDate, selectedDate);
    
    // More detailed logging
    console.log(`Todo "${todo.title}"`);
    console.log(`  - Due Date: ${todo.dueDate}`);
    console.log(`  - Parsed Todo Date: ${todoDate}`);
    console.log(`  - Todo Date Components: ${todoDate.getFullYear()}-${todoDate.getMonth()}-${todoDate.getDate()}`);
    console.log(`  - Selected Date: ${selectedDate}`);
    console.log(`  - Selected Date Components: ${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`);
    console.log(`  - Matches: ${matches}`);
    
    return matches;
  });

  console.log('All calendarTodos:', calendarTodos);
  console.log('Filtered todaysTodos:', todaysTodos);
  console.log('Selected date:', selectedDate);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      console.error('Todo title is required');
      return;
    }

    const todoData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate || todaysDate,
      priority: formData.priority,
      category: formData.category,
      timeCategory: formData.timeCategory,
      estimatedHours: parseFloat(formData.estimatedHours),
      completionPercentage: parseInt(formData.completionPercentage),
      isCompleted: parseInt(formData.completionPercentage) === 100
    };

    console.log('Submitting todo data:', todoData);
    console.log('formData.dueDate:', formData.dueDate);
    console.log('todaysDate:', todaysDate);
    console.log('selectedDate:', selectedDate);

    let success = false;
    
    if (editingTodo) {
      console.log('Updating todo:', editingTodo.id);
      console.log('📝 Update data being sent:', todoData);
      success = await updateCalendarTodo(editingTodo.id, todoData);
      console.log('📦 Update result received:', success);
    } else {
      console.log('Creating new todo');
      success = await createCalendarTodo(todoData);
    }

    console.log('Todo operation success:', success);

    if (success) {
      console.log('✅ Form update successful, updated todo:', success);
      resetForm();
      
      // Force a small delay to ensure state has updated
      setTimeout(() => {
        console.log('� Current todos after update:', calendarTodos.filter(t => t.id === editingTodo?.id));
      }, 100);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: 'today',
      timeCategory: 'personal',
      estimatedHours: 1,
      completionPercentage: 0
    });
    setShowForm(false);
    setEditingTodo(null);
  };

  const handleEdit = (todo) => {
    setFormData({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate.split('T')[0],
      priority: todo.priority,
      category: todo.category,
      timeCategory: todo.timeCategory,
      estimatedHours: todo.estimatedHours,
      completionPercentage: todo.completionPercentage
    });
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleDelete = async (todoId) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await deleteCalendarTodo(todoId);
    }
  };

  // New function to handle progress updates
  const handleProgressUpdate = async (todoId, newPercentage) => {
    console.log('🎯 handleProgressUpdate called:', { todoId, newPercentage });
    
    const updates = { 
      completionPercentage: newPercentage,
      isCompleted: newPercentage === 100 
    };
    
    console.log('📝 Progress updates:', updates);
    
    const result = await updateCalendarTodo(todoId, updates);
    
    if (result) {
      console.log('✅ Progress update successful:', result);
    } else {
      console.error('❌ Progress update failed');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#0088FF';
      case 'low': return '#44AA44';
      default: return '#888888';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'today': return '📅';
      case 'week': return '📆';
      case 'month': return '🗓️';
      case 'year': return '📋';
      case 'someday': return '💭';
      default: return '📝';
    }
  };

  const getTimeCategoryIcon = (timeCategory) => {
    switch (timeCategory) {
      case 'work': return '💼';
      case 'study': return '📚';
      case 'personal': return '👤';
      case 'health': return '💪';
      case 'social': return '👥';
      case 'hobby': return '🎨';
      case 'shopping': return '🛒';
      case 'chores': return '🧹';
      default: return '📌';
    }
  };

  return (
    <div className={`todo-sidebar ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h3>
          Todos - {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          })}
        </h3>
        <button 
          className="add-todo-btn"
          onClick={() => setShowForm(true)}
          title="Add new todo"
        >
          + Add Todo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add Todo Form */}
      {showForm && (
        <form className="todo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="someday">Someday</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time Category</label>
              <select
                name="timeCategory"
                value={formData.timeCategory}
                onChange={handleInputChange}
              >
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
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                min="0.5"
                max="24"
                step="0.5"
              />
            </div>
            {editingTodo && (
              <div className="form-group">
                <label>Completion %</label>
                <input
                  type="number"
                  name="completionPercentage"
                  value={formData.completionPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingTodo ? 'Update Todo' : 'Add Todo'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Todos List */}
      <div className="todos-list">
        {loading && <div className="loading">Loading todos...</div>}
        
        {todaysTodos.length === 0 && !loading ? (
          <div className="no-todos">
            <p>No todos for this date</p>
            <button 
              className="add-first-todo"
              onClick={() => setShowForm(true)}
            >
              Add your first todo
            </button>
          </div>
        ) : (
          <div className="todos-container">
            {todaysTodos.map(todo => {
              console.log('🎯 Rendering todo:', { 
                id: todo.id, 
                title: todo.title, 
                completionPercentage: todo.completionPercentage,
                dueDate: todo.dueDate 
              });
              return (
              <div 
                key={todo.id} 
                className={`todo-item priority-${todo.priority} ${todo.isCompleted ? 'completed' : ''}`}
                style={{ '--priority-color': getPriorityColor(todo.priority) }}
              >
                <div className="todo-header">
                  <div className="todo-title-row">
                    <span className="category-icon">{getCategoryIcon(todo.category)}</span>
                    <span className="time-category-icon">{getTimeCategoryIcon(todo.timeCategory)}</span>
                    <h4 className="todo-title">{todo.title}</h4>
                  </div>
                  <div className="todo-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(todo)}
                      title="Edit todo"
                    >
                      ✎
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(todo.id)}
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {todo.description && (
                  <p className="todo-description">{todo.description}</p>
                )}

                <div className="todo-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progress: {todo.completionPercentage}%</span>
                    <div className="priority-indicator" style={{ backgroundColor: getPriorityColor(todo.priority) }} />
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${todo.completionPercentage}%`,
                        backgroundColor: getPriorityColor(todo.priority)
                      }} 
                    />
                  </div>
                  
                  {/* Quick Progress Buttons */}
                  <div className="progress-controls">
                    <div className="progress-buttons">
                      <button 
                        className={`progress-btn ${todo.completionPercentage === 0 ? 'active' : ''}`}
                        onClick={() => {
                          console.log('🔴 0% Button clicked! Todo:', { id: todo.id, title: todo.title });
                          handleProgressUpdate(todo.id, 0);
                        }}
                        title="Not started"
                      >
                        0%
                      </button>
                      <button 
                        className={`progress-btn ${todo.completionPercentage === 25 ? 'active' : ''}`}
                        onClick={() => {
                          console.log('🟠 25% Button clicked! Todo:', { id: todo.id, title: todo.title });
                          handleProgressUpdate(todo.id, 25);
                        }}
                        title="Started"
                      >
                        25%
                      </button>
                      <button 
                        className={`progress-btn ${todo.completionPercentage === 50 ? 'active' : ''}`}
                        onClick={() => {
                          console.log('🟡 50% Button clicked! Todo:', { id: todo.id, title: todo.title });
                          handleProgressUpdate(todo.id, 50);
                        }}
                        title="Half done"
                      >
                        50%
                      </button>
                      <button 
                        className={`progress-btn ${todo.completionPercentage === 75 ? 'active' : ''}`}
                        onClick={() => {
                          console.log('🔵 75% Button clicked! Todo:', { id: todo.id, title: todo.title });
                          handleProgressUpdate(todo.id, 75);
                        }}
                        title="Almost done"
                      >
                        75%
                      </button>
                      <button 
                        className={`progress-btn complete-btn ${todo.completionPercentage === 100 ? 'active' : ''}`}
                        onClick={() => {
                          console.log('🟢 100% Button clicked! Todo:', { id: todo.id, title: todo.title });
                          handleProgressUpdate(todo.id, 100);
                        }}
                        title="Complete"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>
                </div>

                <div className="todo-meta">
                  <div className="meta-item">
                    <span className="meta-label">Estimated:</span>
                    <span className="meta-value">{todo.estimatedHours}h</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Priority:</span>
                    <span className="meta-value priority-badge" style={{ backgroundColor: getPriorityColor(todo.priority) }}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoSidebar;