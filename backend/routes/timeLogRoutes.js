import express from 'express';
import { 
  getTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
  getDailySummary,
  getWeeklySummary
} from '../controllers/timeLogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/time-logs?date=YYYY-MM-DD
router.get('/', getTimeLogs);

// POST /api/time-logs
router.post('/', createTimeLog);

// PUT /api/time-logs/:id
router.put('/:id', updateTimeLog);

// DELETE /api/time-logs/:id
router.delete('/:id', deleteTimeLog);

// GET /api/time-logs/summary/daily?date=YYYY-MM-DD
router.get('/summary/daily', getDailySummary);

// GET /api/time-logs/summary/weekly?startDate=YYYY-MM-DD
router.get('/summary/weekly', getWeeklySummary);

export default router;