import express from 'express';
import { getFile } from '../controllers/fileController.js';

const router = express.Router();

// Public route — no auth needed for serving media files
router.get('/:fileId', getFile);

export default router;
