// server/controllers/todoController.js
import Todo from '../models/todoModel.js';

// @desc    Get all todos
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
  try {
    // console.log('==== GET TODOS CONTROLLER EXECUTING ====');
    
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    // console.log('==== USER ID FROM REQUEST ====', userId);
    
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    // console.log('==== TODOS FOUND ====', todos.length);
    
    res.status(200).json(todos);
  } catch (error) {
    // console.error('==== GET TODOS ERROR ====', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ message: 'Please add a text field' });
    }

    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;

    const todo = await Todo.create({
      text: req.body.text,
      completed: req.body.completed || false,
      userId
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
  try {
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    const todo = await Todo.findOne({ _id: req.params.id, userId });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, userId }, 
      { new: true }
    );

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
  try {
    // Get userId from authenticated user (provided by protect middleware)
    const userId = req.user.id;
    
    const todo = await Todo.findOne({ _id: req.params.id, userId });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getTodos, createTodo, updateTodo, deleteTodo };