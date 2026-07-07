import express from 'express';
import {
  createMemory,
  getMemories,
  getMemory,
  updateMemory,
  deleteMemory,
} from '../controllers/memoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../config/gridfs.js';

const router = express.Router();

router.post('/', protect, authorize('caregiver'), upload.single('file'), createMemory);
router.get('/:patientId', protect, getMemories);
router.get('/detail/:id', protect, getMemory);
router.put('/:id', protect, authorize('caregiver'), updateMemory);
router.delete('/:id', protect, authorize('caregiver'), deleteMemory);

export default router;
