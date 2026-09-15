import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  linkCaregiver,
  getLinkedUsers,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/link', protect, linkCaregiver);
router.get('/linked', protect, getLinkedUsers);

export default router;
