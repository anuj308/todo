import express from 'express';
import { getDailyDiaryEntry, upsertDailyDiaryEntry } from '../controllers/dailyDiaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDailyDiaryEntry);
router.post('/', upsertDailyDiaryEntry);

export default router;
