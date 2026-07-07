import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Memory from '../models/Memory.js';
import { getGfsBucket } from '../config/db.js';

/**
 * @desc    Create a new memory for a patient
 * @route   POST /api/memories
 * @access  Private (caregiver only)
 */
const createMemory = asyncHandler(async (req, res) => {
  const { patientId, type, title, description, date, location, tags } = req.body;

  if (!patientId || !type || !title) {
    res.status(400);
    throw new Error('Patient ID, type, and title are required');
  }

  // Validate caregiver is linked to this patient
  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(patientId)) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  // Build memory object
  const memoryData = {
    patientId,
    uploadedBy: caregiver._id,
    type,
    title,
    description: description || '',
    date: date ? new Date(date) : null,
    location: location || '',
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
  };

  // If a file was uploaded via multer-gridfs-storage, attach the file ID
  if (req.file) {
    memoryData.fileId = req.file.id;
  }

  const memory = await Memory.create(memoryData);

  res.status(201).json({
    success: true,
    data: memory,
  });
});

/**
 * @desc    Get memories for a patient (paginated, filterable)
 * @route   GET /api/memories/:patientId
 * @access  Private
 */
const getMemories = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 20, type } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Build filter
  const filter = { patientId };
  if (type && ['photo', 'audio', 'story'].includes(type)) {
    filter.type = type;
  }

  const total = await Memory.countDocuments(filter);

  const memories = await Memory.find(filter)
    .populate('uploadedBy', 'name email')
    .sort({ date: -1, createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: memories,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get a single memory by ID
 * @route   GET /api/memories/detail/:id
 * @access  Private
 */
const getMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id).populate('uploadedBy', 'name email');

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  res.status(200).json({
    success: true,
    data: memory,
  });
});

/**
 * @desc    Update memory metadata (not the file)
 * @route   PUT /api/memories/:id
 * @access  Private (caregiver only)
 */
const updateMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id);

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  // Only the caregiver who uploaded or any linked caregiver can update
  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(memory.patientId.toString())) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  const { title, description, date, location, tags } = req.body;

  if (title !== undefined) memory.title = title;
  if (description !== undefined) memory.description = description;
  if (date !== undefined) memory.date = date ? new Date(date) : null;
  if (location !== undefined) memory.location = location;
  if (tags !== undefined) memory.tags = Array.isArray(tags) ? tags : JSON.parse(tags);

  const updated = await memory.save();

  res.status(200).json({
    success: true,
    data: updated,
  });
});

/**
 * @desc    Delete a memory and its associated GridFS file
 * @route   DELETE /api/memories/:id
 * @access  Private (caregiver only)
 */
const deleteMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id);

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(memory.patientId.toString())) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  // Delete the GridFS file if it exists
  if (memory.fileId) {
    try {
      const bucket = getGfsBucket();
      await bucket.delete(new mongoose.Types.ObjectId(memory.fileId));
    } catch (err) {
      console.error(`Failed to delete GridFS file ${memory.fileId}:`, err.message);
    }
  }

  await Memory.findByIdAndDelete(memory._id);

  res.status(200).json({
    success: true,
    message: 'Memory deleted successfully',
  });
});

export { createMemory, getMemories, getMemory, updateMemory, deleteMemory };
