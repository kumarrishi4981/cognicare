import mongoose from 'mongoose';

const completionLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  audioFileId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null, // GridFS file ID for voice recording
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Scheduled time must be in HH:mm format'],
  },
  repeatDays: [
    {
      type: String,
      enum: {
        values: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        message: 'Invalid day: {VALUE}',
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: {
      values: ['medication', 'meal', 'exercise', 'hygiene', 'other'],
      message: 'Category must be medication, meal, exercise, hygiene, or other',
    },
    default: 'other',
  },
  completionLog: [completionLogSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Routine = mongoose.model('Routine', routineSchema);

export default Routine;
