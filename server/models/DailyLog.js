import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Caregiver ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  moodRating: {
    type: Number,
    required: [true, 'Mood rating is required'],
    min: [1, 'Mood rating must be between 1 and 5'],
    max: [5, 'Mood rating must be between 1 and 5'],
  },
  cognitiveNotes: {
    type: String,
    trim: true,
    default: '',
  },
  physicalNotes: {
    type: String,
    trim: true,
    default: '',
  },
  medicationAdherence: {
    type: Boolean,
    default: false,
  },
  mealsConsumed: {
    type: Number,
    min: [0, 'Meals consumed cannot be negative'],
    default: 0,
  },
  sleepHours: {
    type: Number,
    min: [0, 'Sleep hours cannot be negative'],
    max: [24, 'Sleep hours cannot exceed 24'],
    default: 0,
  },
  incidentNotes: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient patient-scoped date-sorted queries
dailyLogSchema.index({ patientId: 1, date: -1 });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

export default DailyLog;
