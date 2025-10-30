import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './ProjectsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ProjectsPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    priority: 'medium',
    goalDate: '',
    tags: []
  });

  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    category: 'today',
    timeCategory: 'personal',
    estimatedHours: '1'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch project details');
      const data = await response.json();
      setProjectDetails(data);
    } catch (err) {
      console.error('Fetch project details error:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectForm)
      });
      
      if (!response.ok) throw new Error('Failed to create project');
      
      await fetchProjects();
      setShowProjectModal(false);
      resetProjectForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${editingProject}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(projectForm)
      });
      
      if (!response.ok) throw new Error('Failed to update project');
      
      await fetchProjects();
      if (selectedProject === editingProject) {
        await fetchProjectDetails(editingProject);
      }
      setShowProjectModal(false);
      setEditingProject(null);
      resetProjectForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? All todos will be unlinked.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
        setProjectDetails(null);
      }
      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    try {
      const dueDateString = todoForm.dueDate ? `${todoForm.dueDate}T${todoForm.dueTime || '00:00'}` : null;
      const dueDate = dueDateString ? new Date(dueDateString) : new Date();
      
      const payload = {
        title: todoForm.title.trim(),
        description: todoForm.description.trim(),
        dueDate: dueDate.toISOString(),
        priority: todoForm.priority,
        category: todoForm.category,
        timeCategory: todoForm.timeCategory,
        estimatedHours: parseFloat(todoForm.estimatedHours) || 0,
        completionPercentage: 0,
        isCompleted: false,
        projectId: selectedProject
      };

      const response = await fetch(`${API_BASE_URL}/calendar-todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to create todo');
      
      await fetchProjectDetails(selectedProject);
      await fetchProjects();
      setShowTodoModal(false);
      resetTodoForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTodoProgress = async (todoId, newPercentage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar-todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completionPercentage: newPercentage,
          isCompleted: newPercentage === 100
        })
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      
      await fetchProjectDetails(selectedProject);
      await fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      color: '#3b82f6',
      priority: 'medium',
      goalDate: '',
      tags: []
    });
  };

  const resetTodoForm = () => {
    setTodoForm({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      category: 'today',
      timeCategory: 'personal',
      estimatedHours: '1'
    });
  };

  const openEditProject = (project) => {
    setEditingProject(project.id);
    setProjectForm({
      title: project.title,
      description: project.description || '',
      color: project.color || '#3b82f6',
      priority: project.priority || 'medium',
      goalDate: project.goalDate ? project.goalDate.split('T')[0] : '',
      tags: project.tags || []
    });
    setShowProjectModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      case 'on-hold': return 'status-on-hold';
      default: return 'status-not-started';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  if (loading) {
    return <div className="loading-page">Loading projects...</div>;
  }

  return (
    <div className={`projects-page ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="projects-header">
        <div className="header-left">
          <h1>📁 Projects</h1>
          <p className="header-subtitle">Organize your todos into meaningful projects</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="primary-btn"
            onClick={() => {
              setEditingProject(null);
              resetProjectForm();
              setShowProjectModal(true);
            }}
          >
            + New Project
          </button>
          <button 
            className="secondary-btn"
            onClick={() => navigate('/calendar')}
          >
            View Calendar →
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="projects-layout">
        {/* Projects List */}
        <aside className="projects-sidebar">
          <h3>All Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>No projects yet</p>
              <button 
                className="create-first-btn"
                onClick={() => setShowProjectModal(true)}
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className="projects-list">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`project-card ${selectedProject === project.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="project-card-header">
                    <div 
                      className="project-color-indicator"
                      style={{ backgroundColor: project.color }}
                    />
                    <h4>{project.title}</h4>
                  </div>
                  
                  <div className="project-card-stats">
                    <span className="project-stat">
                      {project.completedCount}/{project.todoCount} todos
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  {project.todoCount > 0 && (
                    <div className="project-progress-bar">
                      <div 
                        className="project-progress-fill"
                        style={{ 
                          width: `${project.completionRate}%`,
                          backgroundColor: project.color 
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Project Details */}
        <main className="project-details">
          {!selectedProject ? (
            <div className="no-selection">
              <div className="no-selection-content">
                <span className="no-selection-icon">📋</span>
                <h2>Select a project</h2>
                <p>Choose a project from the list to view details and manage todos</p>
              </div>
            </div>
          ) : !projectDetails ? (
            <div className="loading-details">Loading project details...</div>
          ) : (
            <>
              {/* Project Header */}
              <div className="details-header">
                <div className="details-title-section">
                  <div className="title-with-color">
                    <div 
                      className="project-color-dot"
                      style={{ backgroundColor: projectDetails.color }}
                    />
                    <h2>{projectDetails.title}</h2>
                  </div>
                  {projectDetails.description && (
                    <p className="project-description">{projectDetails.description}</p>
                  )}
                </div>
                
                <div className="details-actions">
                  <button 
                    className="edit-project-btn"
                    onClick={() => openEditProject(projectDetails)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-project-btn"
                    onClick={() => handleDeleteProject(projectDetails.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Project Meta */}
              <div className="project-meta">
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`status-badge ${getStatusBadgeClass(projectDetails.status)}`}>
                    {projectDetails.status}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Priority:</span>
                  <span className={`priority-badge ${getPriorityBadgeClass(projectDetails.priority)}`}>
                    {projectDetails.priority}
                  </span>
                </div>
                {projectDetails.goalDate && (
                  <div className="meta-item">
                    <span className="meta-label">Goal Date:</span>
                    <span className="meta-value">
                      {new Date(projectDetails.goalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Stats */}
              <div className="project-stats-grid">
                <div className="stat-box">
                  <span className="stat-number">{projectDetails.todoCount}</span>
                  <span className="stat-label">Total Todos</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{projectDetails.completedCount}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{projectDetails.completionRate}%</span>
                  <span className="stat-label">Progress</span>
                </div>
              </div>

              {/* Todos Section */}
              <div className="project-todos-section">
                <div className="todos-header">
                  <h3>Todos</h3>
                  <button 
                    className="add-todo-btn"
                    onClick={() => setShowTodoModal(true)}
                  >
                    + Add Todo
                  </button>
                </div>

                {projectDetails.todos && projectDetails.todos.length > 0 ? (
                  <div className="todos-list">
                    {projectDetails.todos.map(todo => (
                      <div key={todo.id} className="todo-item">
                        <div className="todo-header">
                          <div className="todo-title-section">
                            <h4>{todo.title}</h4>
                            <span className={`priority-badge ${getPriorityBadgeClass(todo.priority)}`}>
                              {todo.priority}
                            </span>
                          </div>
                          <span className="todo-due-date">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {todo.description && (
                          <p className="todo-description">{todo.description}</p>
                        )}
                        
                        <div className="todo-progress-section">
                          <div className="progress-label">
                            <span>Progress: {todo.completionPercentage}%</span>
                            {todo.isCompleted && <span className="completed-badge">✓ Completed</span>}
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={todo.completionPercentage}
                            onChange={(e) => handleUpdateTodoProgress(todo.id, parseInt(e.target.value))}
                            className="progress-slider"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-todos">
                    <p>No todos yet in this project</p>
                    <button 
                      className="add-first-todo-btn"
                      onClick={() => setShowTodoModal(true)}
                    >
                      Add your first todo
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <Modal 
          title={editingProject ? 'Edit Project' : 'New Project'} 
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
            resetProjectForm();
          }}
        >
          <form 
            className="project-form" 
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          >
            <label>
              Project Title *
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                required
                placeholder="e.g., Website Redesign"
              />
            </label>

            <label>
              Description
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                rows={3}
                placeholder="Brief description of the project"
              />
            </label>

            <div className="form-row">
              <label>
                Color
                <input
                  type="color"
                  value={projectForm.color}
                  onChange={(e) => setProjectForm({...projectForm, color: e.target.value})}
                />
              </label>

              <label>
                Priority
                <select
                  value={projectForm.priority}
                  onChange={(e) => setProjectForm({...projectForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label>
                Goal Date
                <input
                  type="date"
                  value={projectForm.goalDate}
                  onChange={(e) => setProjectForm({...projectForm, goalDate: e.target.value})}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="secondary"
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                  resetProjectForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="primary">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Todo Modal */}
      {showTodoModal && (
        <Modal 
          title="Add Todo to Project" 
          onClose={() => {
            setShowTodoModal(false);
            resetTodoForm();
          }}
        >
          <form className="todo-form" onSubmit={handleCreateTodo}>
            <label>
              Title *
              <input
                type="text"
                value={todoForm.title}
                onChange={(e) => setTodoForm({...todoForm, title: e.target.value})}
                required
                placeholder="What needs to be done?"
              />
            </label>

            <label>
              Description
              <textarea
                value={todoForm.description}
                onChange={(e) => setTodoForm({...todoForm, description: e.target.value})}
                rows={3}
                placeholder="Add details"
              />
            </label>

            <div className="form-row">
              <label>
                Due Date
                <input
                  type="date"
                  value={todoForm.dueDate}
                  onChange={(e) => setTodoForm({...todoForm, dueDate: e.target.value})}
                />
              </label>
              
              <label>
                Due Time
                <input
                  type="time"
                  value={todoForm.dueTime}
                  onChange={(e) => setTodoForm({...todoForm, dueTime: e.target.value})}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={todoForm.priority}
                  onChange={(e) => setTodoForm({...todoForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label>
                Category
                <select
                  value={todoForm.category}
                  onChange={(e) => setTodoForm({...todoForm, category: e.target.value})}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="someday">Someday</option>
                </select>
              </label>

              <label>
                Est. Hours
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={todoForm.estimatedHours}
                  onChange={(e) => setTodoForm({...todoForm, estimatedHours: e.target.value})}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="secondary"
                onClick={() => {
                  setShowTodoModal(false);
                  resetTodoForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="primary">
                Add Todo
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsPage;
