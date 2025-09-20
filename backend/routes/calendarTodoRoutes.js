import express from 'express';
import { 
  getCalendarTodos,
  createCalendarTodo,
  updateCalendarTodo,
  deleteCalendarTodo,
  getRecurringTodos,
  bulkUpdateTodos
} from '../controllers/calendarTodoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/calendar-todos?startDate=...&endDate=...
router.get('/', getCalendarTodos);

// POST /api/calendar-todos
router.post('/', createCalendarTodo);

// PUT /api/calendar-todos/:id
router.put('/:id', updateCalendarTodo);

// DELETE /api/calendar-todos/:id
router.delete('/:id', deleteCalendarTodo);

// GET /api/calendar-todos/recurring
router.get('/recurring', getRecurringTodos);

// PUT /api/calendar-todos/bulk
router.put('/bulk', bulkUpdateTodos);

export default router;