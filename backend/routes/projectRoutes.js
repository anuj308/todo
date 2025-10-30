import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project CRUD routes
router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);
router.route('/:id/stats').get(getProjectStats);

export default router;
