import express from 'express';
import { chat, getHistory, updateProfile, getProfile, clearHistory } from '../controllers/companionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chat);
router.get('/history/:patientId', protect, getHistory);
router.delete('/history/:patientId', protect, clearHistory);
router.put('/profile/:patientId', protect, authorize('caregiver'), updateProfile);
router.get('/profile/:patientId', protect, getProfile);

export default router;
