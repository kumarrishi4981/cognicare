import express from 'express';
import {
  createRoutine,
  getRoutines,
  updateRoutine,
  completeRoutine,
  deleteRoutine,
} from '../controllers/routineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../config/gridfs.js';

const router = express.Router();

router.post('/', protect, authorize('caregiver'), upload.single('audio'), createRoutine);
router.get('/:patientId', protect, getRoutines);
router.put('/:id', protect, authorize('caregiver'), updateRoutine);
router.patch('/:id/complete', protect, completeRoutine);
router.delete('/:id', protect, authorize('caregiver'), deleteRoutine);

export default router;
