import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { getGfsBucket } from '../config/db.js';

/**
 * @desc    Stream a GridFS file to the client
 * @route   GET /api/files/:fileId
 * @access  Public (no auth needed for serving media)
 */
const getFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  // Validate fileId format
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    res.status(400);
    throw new Error('Invalid file ID format');
  }

  const bucket = getGfsBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);

  // Look up the file metadata in the uploads.files collection
  const files = await bucket.find({ _id: objectId }).toArray();

  if (!files || files.length === 0) {
    res.status(404);
    throw new Error('File not found');
  }

  const file = files[0];

  // Set the appropriate content-type header
  const contentType = file.contentType || 'application/octet-stream';
  res.set('Content-Type', contentType);
  res.set('Content-Disposition', `inline; filename="${file.filename}"`);

  if (file.length) {
    res.set('Content-Length', file.length.toString());
  }

  // Open a download stream and pipe to the response
  const downloadStream = bucket.openDownloadStream(objectId);

  downloadStream.on('error', (err) => {
    console.error('GridFS download stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error streaming file',
      });
    }
  });

  downloadStream.pipe(res);
});

export { getFile };
