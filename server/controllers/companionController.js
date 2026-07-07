import asyncHandler from 'express-async-handler';
import ChatHistory from '../models/ChatHistory.js';
import PatientProfile from '../models/PatientProfile.js';
import { chatWithCompanion } from '../services/aiCompanion.js';

/**
 * @desc    Chat with the AI companion (patient sends message, gets AI reply)
 * @route   POST /api/companion/chat
 * @access  Private
 */
const chat = asyncHandler(async (req, res) => {
  const { message, patientId } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Determine the patient ID — if the user is a patient, use their own ID.
  // If a caregiver is testing, they must provide patientId.
  const targetPatientId = patientId || req.user._id;

  // Load patient profile for contextual AI responses
  const profile = await PatientProfile.findOne({ patientId: targetPatientId });

  // Load or create conversation history
  let chatHistory = await ChatHistory.findOne({ patientId: targetPatientId });
  if (!chatHistory) {
    chatHistory = await ChatHistory.create({
      patientId: targetPatientId,
      messages: [],
    });
  }

  // Get the AI response
  const aiResponse = await chatWithCompanion(
    message,
    profile,
    chatHistory.messages
  );

  // Save user message and AI response to history
  chatHistory.messages.push(
    {
      role: 'user',
      content: message,
      timestamp: new Date(),
    },
    {
      role: 'model',
      content: aiResponse,
      timestamp: new Date(),
    }
  );

  await chatHistory.save();

  res.status(200).json({
    success: true,
    data: {
      userMessage: message,
      aiResponse,
    },
  });
});

/**
 * @desc    Get AI conversation history for a patient
 * @route   GET /api/companion/history/:patientId
 * @access  Private
 */
const getHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const chatHistory = await ChatHistory.findOne({ patientId });

  res.status(200).json({
    success: true,
    data: chatHistory ? chatHistory.messages : [],
  });
});

/**
 * @desc    Update a patient's profile (caregiver only)
 * @route   PUT /api/companion/profile/:patientId
 * @access  Private (caregiver only)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { preferredName, familyMembers, keyFacts, homeAddress, emergencyContacts } = req.body;

  let profile = await PatientProfile.findOne({ patientId });

  if (!profile) {
    // Create profile if it doesn't exist
    profile = await PatientProfile.create({
      patientId,
      preferredName: preferredName || '',
      familyMembers: familyMembers || [],
      keyFacts: keyFacts || [],
      homeAddress: homeAddress || '',
      emergencyContacts: emergencyContacts || [],
    });
  } else {
    // Update existing profile
    if (preferredName !== undefined) profile.preferredName = preferredName;
    if (familyMembers !== undefined) profile.familyMembers = familyMembers;
    if (keyFacts !== undefined) profile.keyFacts = keyFacts;
    if (homeAddress !== undefined) profile.homeAddress = homeAddress;
    if (emergencyContacts !== undefined) profile.emergencyContacts = emergencyContacts;

    await profile.save();
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

/**
 * @desc    Get a patient's profile
 * @route   GET /api/companion/profile/:patientId
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const profile = await PatientProfile.findOne({ patientId });

  if (!profile) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  res.status(200).json({
    success: true,
    data: profile,
  });
});

/**
 * @desc    Clear AI conversation history for a patient
 * @route   DELETE /api/companion/history/:patientId
 * @access  Private
 */
const clearHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  await ChatHistory.findOneAndDelete({ patientId });

  res.status(200).json({
    success: true,
    message: 'Chat history cleared successfully',
  });
});

export { chat, getHistory, updateProfile, getProfile, clearHistory };
