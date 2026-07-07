import asyncHandler from 'express-async-handler';
import DailyLog from '../models/DailyLog.js';

/**
 * @desc    Create a daily log entry for a patient
 * @route   POST /api/logs
 * @access  Private (caregiver only)
 */
const createLog = asyncHandler(async (req, res) => {
  const {
    patientId,
    date,
    moodRating,
    cognitiveNotes,
    physicalNotes,
    medicationAdherence,
    mealsConsumed,
    sleepHours,
    incidentNotes,
  } = req.body;

  if (!patientId || !date || moodRating === undefined) {
    res.status(400);
    throw new Error('Patient ID, date, and mood rating are required');
  }

  // Validate caregiver linkage
  const caregiver = req.user;
  if (!caregiver.linkedPatients.map((id) => id.toString()).includes(patientId)) {
    res.status(403);
    throw new Error('You are not linked to this patient');
  }

  const log = await DailyLog.create({
    patientId,
    caregiverId: caregiver._id,
    date: new Date(date),
    moodRating,
    cognitiveNotes: cognitiveNotes || '',
    physicalNotes: physicalNotes || '',
    medicationAdherence: medicationAdherence || false,
    mealsConsumed: mealsConsumed || 0,
    sleepHours: sleepHours || 0,
    incidentNotes: incidentNotes || '',
  });

  res.status(201).json({
    success: true,
    data: log,
  });
});

/**
 * @desc    Get daily logs for a patient (paginated, with optional date range)
 * @route   GET /api/logs/:patientId
 * @access  Private
 */
const getLogs = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const filter = { patientId };

  // Apply date range filter
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const total = await DailyLog.countDocuments(filter);

  const logs = await DailyLog.find(filter)
    .populate('caregiverId', 'name email')
    .sort({ date: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @desc    Get aggregated trends for a patient over the last 30 days
 * @route   GET /api/logs/:patientId/trends
 * @access  Private
 */
const getTrends = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const logs = await DailyLog.find({
    patientId,
    date: { $gte: thirtyDaysAgo },
  })
    .sort({ date: 1 })
    .select('date moodRating sleepHours medicationAdherence mealsConsumed');

  // Format data for charts
  const trends = logs.map((log) => ({
    date: log.date,
    moodRating: log.moodRating,
    sleepHours: log.sleepHours,
    medicationAdherence: log.medicationAdherence,
    mealsConsumed: log.mealsConsumed,
  }));

  // Calculate summary statistics
  const totalLogs = logs.length;
  const summary = {
    averageMood: totalLogs > 0
      ? parseFloat((logs.reduce((sum, l) => sum + l.moodRating, 0) / totalLogs).toFixed(2))
      : 0,
    averageSleep: totalLogs > 0
      ? parseFloat((logs.reduce((sum, l) => sum + l.sleepHours, 0) / totalLogs).toFixed(2))
      : 0,
    medicationAdherenceRate: totalLogs > 0
      ? parseFloat(
          ((logs.filter((l) => l.medicationAdherence).length / totalLogs) * 100).toFixed(1)
        )
      : 0,
    totalEntries: totalLogs,
  };

  res.status(200).json({
    success: true,
    data: {
      trends,
      summary,
    },
  });
});

export { createLog, getLogs, getTrends };
