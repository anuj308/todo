import express from 'express';
import { 
  registerUser,
  loginUser,
  logoutUser,
  getMe
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Logout user
router.post('/logout', logoutUser);

// Get user profile - protected route
router.get('/me', protect, getMe);

export default router;