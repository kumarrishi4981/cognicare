import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: {
        values: ['user', 'model'],
        message: 'Role must be user or model',
      },
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    messages: [chatMessageSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
