import express from 'express';
import { createLog, getLogs, getTrends } from '../controllers/logController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('caregiver'), createLog);
router.get('/:patientId/trends', protect, getTrends);
router.get('/:patientId', protect, getLogs);

export default router;
