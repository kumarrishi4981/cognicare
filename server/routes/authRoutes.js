import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  linkCaregiver,
  getLinkedUsers,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/link', protect, linkCaregiver);
router.get('/linked', protect, getLinkedUsers);

export default router;
