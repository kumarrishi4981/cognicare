import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import { getIO } from '../services/socketService.js';

/**
 * @desc    Send a message (and broadcast via Socket.io)
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { patientId, content, type } = req.body;

  if (!patientId || !content) {
    res.status(400);
    throw new Error('Patient ID and content are required');
  }

  const message = await Message.create({
    patientId,
    senderId: req.user._id,
    content,
    type: type || 'text',
  });

  // Populate sender info for the response
  const populatedMessage = await Message.findById(message._id).populate(
    'senderId',
    'name email role profileImage'
  );

  // Emit real-time event to all users in the patient's room
  const io = getIO();
  if (io) {
    io.to(patientId.toString()).emit('newMessage', populatedMessage);
  }

  res.status(201).json({
    success: true,
    data: populatedMessage,
  });
});

/**
 * @desc    Get message history for a patient (paginated)
 * @route   GET /api/messages/:patientId
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const total = await Message.countDocuments({ patientId });

  const messages = await Message.find({ patientId })
    .populate('senderId', 'name email role profileImage')
    .sort({ createdAt: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export { sendMessage, getMessages };
