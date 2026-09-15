import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['patient', 'caregiver'],
      message: 'Role must be either patient or caregiver',
    },
    required: [true, 'Role is required'],
  },
  profileImage: {
    type: String,
    default: null,
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls (only patients get invite codes)
  },
  linkedPatients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  linkedCaregivers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Generate a random 6-character uppercase alphanumeric invite code.
 * @returns {string}
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Pre-save hook:
 * 1. Hash password if modified
 * 2. Generate invite code for patients if not already set
 */
userSchema.pre('save', async function () {
  // Generate invite code for patients
  if (this.role === 'patient' && !this.inviteCode) {
    // Generate a unique invite code — retry if collision occurs
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateInviteCode();
      const existing = await mongoose.model('User').findOne({ inviteCode: code });
      if (!existing) {
        isUnique = true;
      }
    }
    this.inviteCode = code;
  }

  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Error in User pre-save hook:', error);
    throw error;
  }
});

/**
 * Compare entered password with stored hashed password.
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate and hash password reset token.
 * @returns {string} Plain reset token
 */
userSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiration (30 minutes)
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
