import CalendarTodo from '../models/calendarTodoModel.js';

// @desc    Get calendar todos for date range
// @route   GET /api/calendar-todos?startDate=...&endDate=...
// @access  Private
export const getCalendarTodos = async (req, res) => {
  try {
    const { startDate, endDate, category, priority } = req.query;
    const userId = req.user.id;

    console.log('Getting calendar todos with params:', { startDate, endDate, category, priority, userId });

    // Build query
    let query = { userId };

    // Add date range filter
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.dueDate = { $lte: new Date(endDate) };
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    console.log('Final query:', query);

    // Add priority filter
    if (priority) {
      query.priority = priority;
    }

    const todos = await CalendarTodo.find(query)
      .sort({ dueDate: 1, priority: -1, createdAt: -1 });

    console.log('Found todos:', todos.length, 'todos');
    console.log('Todos:', todos.map(t => ({ id: t._id, title: t.title, dueDate: t.dueDate })));

    res.status(200).json(todos);
  } catch (error) {
    console.error('Error fetching calendar todos:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create new calendar todo
// @route   POST /api/calendar-todos
// @access  Private
export const createCalendarTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const todoData = {
      ...req.body,
      userId
    };

    console.log('Creating calendar todo with data:', todoData);
    console.log('User ID:', userId);

    // Validate required fields
    if (!todoData.title || !todoData.dueDate) {
      console.log('Validation failed - missing title or dueDate');
      return res.status(400).json({ 
        message: 'Title and due date are required' 
      });
    }

    // Create the todo
    const todo = await CalendarTodo.create(todoData);
    console.log('Todo created successfully:', todo);

    // Handle recurring todos
    if (todo.isRecurring && todo.recurringPattern) {
      await createRecurringInstances(todo);
    }

    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating calendar todo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update calendar todo
// @route   PUT /api/calendar-todos/:id
// @access  Private
export const updateCalendarTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Find the todo
    const todo = await CalendarTodo.findOne({ _id: id, userId });

    if (!todo) {
      return res.status(404).json({ 
        message: 'Todo not found' 
      });
    }

    // Check if yesterday's todos can be edited
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    if (todo.dueDate < yesterday && !req.user.canEditPastTodos) {
      return res.status(403).json({ 
        message: 'Cannot edit todos from previous days' 
      });
    }

    // Update the todo
    Object.assign(todo, updates);
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    console.error('Error updating calendar todo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete calendar todo
// @route   DELETE /api/calendar-todos/:id
// @access  Private
export const deleteCalendarTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await CalendarTodo.findOne({ _id: id, userId });

    if (!todo) {
      return res.status(404).json({ 
        message: 'Todo not found' 
      });
    }

    await CalendarTodo.deleteOne({ _id: id, userId });

    res.status(200).json({ 
      message: 'Todo deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting calendar todo:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get recurring todos
// @route   GET /api/calendar-todos/recurring
// @access  Private
export const getRecurringTodos = async (req, res) => {
  try {
    const userId = req.user.id;

    const recurringTodos = await CalendarTodo.find({
      userId,
      isRecurring: true,
      parentTodoId: null // Only get parent todos, not instances
    }).sort({ createdAt: -1 });

    res.status(200).json(recurringTodos);
  } catch (error) {
    console.error('Error fetching recurring todos:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Bulk update todos
// @route   PUT /api/calendar-todos/bulk
// @access  Private
export const bulkUpdateTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { todoIds, updates } = req.body;

    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({ 
        message: 'Todo IDs array is required' 
      });
    }

    const result = await CalendarTodo.updateMany(
      { 
        _id: { $in: todoIds }, 
        userId 
      },
      { $set: updates },
      { runValidators: true }
    );

    res.status(200).json({
      message: `Updated ${result.modifiedCount} todos`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating todos:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Helper function to create recurring todo instances
const createRecurringInstances = async (parentTodo) => {
  try {
    const instances = [];
    const startDate = new Date(parentTodo.dueDate);
    const endDate = new Date(parentTodo.recurringEndDate);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Skip the original date (already created)
      if (currentDate.getTime() !== startDate.getTime()) {
        const instanceData = {
          ...parentTodo.toObject(),
          _id: undefined,
          dueDate: new Date(currentDate),
          parentTodoId: parentTodo._id,
          isRecurring: false // Instances are not recurring themselves
        };
        
        instances.push(instanceData);
      }
      
      // Move to next occurrence based on pattern
      switch (parentTodo.recurringPattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          break;
      }
    }
    
    if (instances.length > 0) {
      await CalendarTodo.insertMany(instances);
    }
  } catch (error) {
    console.error('Error creating recurring instances:', error);
  }
};