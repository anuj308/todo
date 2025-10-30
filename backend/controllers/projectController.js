import Project from '../models/projectModel.js';
import CalendarTodo from '../models/calendarTodoModel.js';

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // Get todo counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const todos = await CalendarTodo.find({ projectId: project._id, userId: req.user.id });
        const completedTodos = todos.filter(t => t.isCompleted || t.completionPercentage === 100);
        
        return {
          ...project.toJSON(),
          todoCount: todos.length,
          completedCount: completedTodos.length,
          completionRate: todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0,
        };
      })
    );
    
    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// @desc    Get single project with todos
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const todos = await CalendarTodo.find({ 
      projectId: project._id, 
      userId: req.user.id 
    }).sort({ dueDate: 1, priority: -1 });

    const completedTodos = todos.filter(t => t.isCompleted || t.completionPercentage === 100);

    res.json({
      ...project.toJSON(),
      todos,
      todoCount: todos.length,
      completedCount: completedTodos.length,
      completionRate: todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { title, description, color, priority, goalDate, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim() || '',
      color: color || '#3b82f6',
      priority: priority || 'medium',
      goalDate: goalDate || null,
      tags: tags || [],
      status: 'not-started',
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, description, color, status, priority, goalDate, tags, completedDate } = req.body;

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (color !== undefined) project.color = color;
    if (status !== undefined) {
      project.status = status;
      if (status === 'completed' && !project.completedDate) {
        project.completedDate = new Date();
      } else if (status !== 'completed') {
        project.completedDate = null;
      }
    }
    if (priority !== undefined) project.priority = priority;
    if (goalDate !== undefined) project.goalDate = goalDate;
    if (tags !== undefined) project.tags = tags;
    if (completedDate !== undefined) project.completedDate = completedDate;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove projectId from all associated todos
    await CalendarTodo.updateMany(
      { projectId: project._id, userId: req.user.id },
      { $set: { projectId: null } }
    );

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const todos = await CalendarTodo.find({ 
      projectId: project._id, 
      userId: req.user.id 
    });

    const completedTodos = todos.filter(t => t.isCompleted || t.completionPercentage === 100);
    const overdueTodos = todos.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date());
    
    const byPriority = {
      urgent: todos.filter(t => t.priority === 'urgent').length,
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length,
    };

    const totalEstimatedHours = todos.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActualHours = todos.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    res.json({
      projectId: project._id,
      projectTitle: project.title,
      totalTodos: todos.length,
      completedTodos: completedTodos.length,
      overdueTodos: overdueTodos.length,
      completionRate: todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0,
      byPriority,
      totalEstimatedHours,
      totalActualHours,
      status: project.status,
      goalDate: project.goalDate,
      daysUntilGoal: project.goalDate ? Math.ceil((new Date(project.goalDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Error fetching project statistics', error: error.message });
  }
};
