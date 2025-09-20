import express from 'express';
import { 
  getProductivityMetrics,
  updateDailyMetrics,
  getProductivityTrends,
  getWeeklyMetrics,
  getMonthlyMetrics,
  setDailyGoal
} from '../controllers/productivityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/productivity-metrics?date=YYYY-MM-DD
router.get('/', getProductivityMetrics);

// POST /api/productivity-metrics/update-daily
router.post('/update-daily', updateDailyMetrics);

// GET /api/productivity-metrics/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/trends', getProductivityTrends);

// GET /api/productivity-metrics/weekly?date=YYYY-MM-DD
router.get('/weekly', getWeeklyMetrics);

// GET /api/productivity-metrics/monthly?date=YYYY-MM-DD
router.get('/monthly', getMonthlyMetrics);

// PUT /api/productivity-metrics/goal
router.put('/goal', setDailyGoal);

export default router;