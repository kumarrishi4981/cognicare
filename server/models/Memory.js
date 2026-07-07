import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required'],
  },
  type: {
    type: String,
    enum: {
      values: ['photo', 'audio', 'story'],
      message: 'Memory type must be photo, audio, or story',
    },
    required: [true, 'Memory type is required'],
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
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null, // GridFS file ID — used for photo/audio types
  },
  date: {
    type: Date,
    default: null, // When the memory occurred
  },
  location: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient patient-scoped date-sorted queries
memorySchema.index({ patientId: 1, date: -1 });

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
