import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Routine from '../models/Routine.js';
import { getGfsBucket } from '../config/db.js';

/**
 * @desc    Create a new routine for a patient
 * @route   POST /api/routines
 * @access  Private (caregiver only)
 */
const createRoutine = asyncHandler(async (req, res) => {
  const { patientId, title, description, scheduledTime, repeatDays, category } = req.body;

  if (!patientId || !title || !scheduledTime) {
    res.status(400);
    throw new Error('Patient ID, title, and scheduled time are required');
  }

  // Validate caregiver linkage
  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(patientId)) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  const routineData = {
    patientId,
    createdBy: caregiver._id,
    title,
    description: description || '',
    scheduledTime,
    repeatDays: repeatDays
      ? Array.isArray(repeatDays)
        ? repeatDays
        : JSON.parse(repeatDays)
      : [],
    category: category || 'other',
  };

  // Attach audio file if uploaded
  if (req.file) {
    routineData.audioFileId = req.file.id;
  }

  const routine = await Routine.create(routineData);

  res.status(201).json({
    success: true,
    data: routine,
  });
});

/**
 * @desc    Get all routines for a patient
 * @route   GET /api/routines/:patientId
 * @access  Private
 */
const getRoutines = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { day, category } = req.query;

  const filter = { patientId };

  // Filter by day of week
  if (day && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(day)) {
    filter.repeatDays = day;
  }

  // Filter by category
  if (category && ['medication', 'meal', 'exercise', 'hygiene', 'other'].includes(category)) {
    filter.category = category;
  }

  const routines = await Routine.find(filter)
    .populate('createdBy', 'name email')
    .sort({ scheduledTime: 1 });

  res.status(200).json({
    success: true,
    data: routines,
  });
});

/**
 * @desc    Update routine metadata
 * @route   PUT /api/routines/:id
 * @access  Private (caregiver only)
 */
const updateRoutine = asyncHandler(async (req, res) => {
  const routine = await Routine.findById(req.params.id);

  if (!routine) {
    res.status(404);
    throw new Error('Routine not found');
  }

  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(routine.patientId.toString())) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  const { title, description, scheduledTime, repeatDays, isActive, category } = req.body;

  if (title !== undefined) routine.title = title;
  if (description !== undefined) routine.description = description;
  if (scheduledTime !== undefined) routine.scheduledTime = scheduledTime;
  if (repeatDays !== undefined) {
    routine.repeatDays = Array.isArray(repeatDays) ? repeatDays : JSON.parse(repeatDays);
  }
  if (isActive !== undefined) routine.isActive = isActive;
  if (category !== undefined) routine.category = category;

  const updated = await routine.save();

  res.status(200).json({
    success: true,
    data: updated,
  });
});

/**
 * @desc    Mark a routine as completed for today
 * @route   PATCH /api/routines/:id/complete
 * @access  Private
 */
const completeRoutine = asyncHandler(async (req, res) => {
  const routine = await Routine.findById(req.params.id);

  if (!routine) {
    res.status(404);
    throw new Error('Routine not found');
  }

  // Check if already completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alreadyCompletedToday = routine.completionLog.some((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  if (alreadyCompletedToday) {
    res.status(400);
    throw new Error('This routine has already been marked as completed today');
  }

  routine.completionLog.push({
    date: today,
    completedAt: new Date(),
    completedBy: req.user._id,
  });

  const updated = await routine.save();

  res.status(200).json({
    success: true,
    message: 'Routine marked as completed',
    data: updated,
  });
});

/**
 * @desc    Delete a routine and its associated audio file from GridFS
 * @route   DELETE /api/routines/:id
 * @access  Private (caregiver only)
 */
const deleteRoutine = asyncHandler(async (req, res) => {
  const routine = await Routine.findById(req.params.id);

  if (!routine) {
    res.status(404);
    throw new Error('Routine not found');
  }

  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(routine.patientId.toString())) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  // Delete audio file from GridFS if it exists
  if (routine.audioFileId) {
    try {
      const bucket = getGfsBucket();
      await bucket.delete(new mongoose.Types.ObjectId(routine.audioFileId));
    } catch (err) {
      console.error(`Failed to delete GridFS audio file ${routine.audioFileId}:`, err.message);
    }
  }

  await Routine.findByIdAndDelete(routine._id);

  res.status(200).json({
    success: true,
    message: 'Routine deleted successfully',
  });
});

export { createRoutine, getRoutines, updateRoutine, completeRoutine, deleteRoutine };
