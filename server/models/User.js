import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'EMPLOYEE', 'CITIZEN'],
    default: 'CITIZEN',
    index: true
  },
  department: {
    id: { type: String, default: '' },
    code: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled', 'Pending'],
    default: 'Active',
    index: true
  },
  mustResetPassword: {
    type: Boolean,
    default: false
  },
  resetPasswordOtp: {
    type: String,
    default: null
  },
  resetPasswordOtpExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Static helper to hash password
UserSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const User = mongoose.model('User', UserSchema);
