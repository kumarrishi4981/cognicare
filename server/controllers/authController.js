import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide name, email, password, and role');
  }

  if (!['patient', 'caregiver'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either patient or caregiver');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  // Create the user
  const user = await User.create({ name, email, password, role });

  // Auto-create an empty PatientProfile for patients
  if (role === 'patient') {
    await PatientProfile.create({
      patientId: user._id,
      preferredName: name,
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      inviteCode: user.inviteCode || null,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      inviteCode: user.inviteCode || null,
      profileImage: user.profileImage,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('linkedPatients', 'name email profileImage')
    .populate('linkedCaregivers', 'name email profileImage');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Refresh access token using a refresh token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token — user not found');
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});

/**
 * @desc    Link a caregiver to a patient using the patient's invite code
 * @route   POST /api/auth/link
 * @access  Private
 */
const linkCaregiver = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    res.status(400);
    throw new Error('Invite code is required');
  }

  const currentUser = req.user;

  // Only caregivers can use an invite code to link
  if (currentUser.role !== 'caregiver') {
    res.status(403);
    throw new Error('Only caregivers can link to patients using an invite code');
  }

  // Find the patient with this invite code
  const patient = await User.findOne({ inviteCode: inviteCode.toUpperCase(), role: 'patient' });

  if (!patient) {
    res.status(404);
    throw new Error('Invalid invite code — no patient found');
  }

  // Check if already linked
  if (currentUser.linkedPatients.includes(patient._id)) {
    res.status(400);
    throw new Error('You are already linked to this patient');
  }

  // Link: add patient to caregiver's linkedPatients
  await User.findByIdAndUpdate(currentUser._id, {
    $addToSet: { linkedPatients: patient._id },
  });

  // Link: add caregiver to patient's linkedCaregivers
  await User.findByIdAndUpdate(patient._id, {
    $addToSet: { linkedCaregivers: currentUser._id },
  });

  res.status(200).json({
    success: true,
    message: `Successfully linked to patient: ${patient.name}`,
    data: {
      patientId: patient._id,
      patientName: patient.name,
    },
  });
});

/**
 * @desc    Get linked patients (if caregiver) or linked caregivers (if patient)
 * @route   GET /api/auth/linked
 * @access  Private
 */
const getLinkedUsers = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === 'caregiver') {
    const caregiver = await User.findById(user._id).populate(
      'linkedPatients',
      'name email profileImage inviteCode'
    );

    res.status(200).json({
      success: true,
      data: {
        role: 'caregiver',
        linkedUsers: caregiver.linkedPatients,
      },
    });
  } else if (user.role === 'patient') {
    const patient = await User.findById(user._id).populate(
      'linkedCaregivers',
      'name email profileImage'
    );

    res.status(200).json({
      success: true,
      data: {
        role: 'patient',
        linkedUsers: patient.linkedCaregivers,
      },
    });
  } else {
    res.status(400);
    throw new Error('Unknown user role');
  }
});

export { registerUser, loginUser, getMe, refreshToken, linkCaregiver, getLinkedUsers };
