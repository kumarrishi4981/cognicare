import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

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

/**
 * @desc    Forgot Password - Request reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // For security, don't leak whether email exists or not
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because a password reset request was submitted for your CogniCare account.\n\nPlease click the following link (or paste it into your browser) to reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes. If you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background-color: #F8FAF9; border-radius: 16px; border: 1px solid #E2E8F0; color: #1E293B;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px;">🧠</span>
        <h2 style="color: #0D9488; margin: 8px 0 4px 0; font-size: 24px;">CogniCare</h2>
        <p style="color: #64748B; font-size: 14px; margin: 0;">Compassionate care for loved ones</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; color: #0F172A; font-size: 18px;">Password Reset Request</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Hello ${user.name}, we received a request to reset the password for your account. Click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #0D9488, #059669); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
          This link is valid for <strong>30 minutes</strong>. If you did not make this request, you can safely ignore this email and your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 20px 0;" />
        <p style="color: #94A3B8; font-size: 12px; word-break: break-all;">
          If the button above doesn't work, copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #0D9488;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'CogniCare - Password Reset Request',
      message,
      html,
    });

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Error sending reset email:', error);
    res.status(500);
    throw new Error(error.message || 'Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset Password with token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Hash incoming token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset link');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.',
  });
});

export {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  linkCaregiver,
  getLinkedUsers,
  forgotPassword,
  resetPassword,
};
