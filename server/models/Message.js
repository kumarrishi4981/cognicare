import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: {
      values: ['text', 'alert', 'update'],
      message: 'Message type must be text, alert, or update',
    },
    default: 'text',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient patient-scoped chronological queries
messageSchema.index({ patientId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
