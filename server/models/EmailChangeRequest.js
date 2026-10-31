import mongoose from 'mongoose';

const EmailChangeRequestSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['CITIZEN', 'EMPLOYEE'],
    default: 'EMPLOYEE',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  officerName: {
    type: String,
    default: '',
    trim: true
  },
  citizenName: {
    type: String,
    default: '',
    trim: true
  },
  employeeId: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  department: {
    id: { type: String, default: '' },
    code: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  designation: {
    type: String,
    default: 'Grievance Redressal Officer'
  },
  currentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  requestedEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  reason: {
    type: String,
    required: [true, 'Official justification reason is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedByName: {
    type: String,
    default: ''
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const EmailChangeRequest = mongoose.model('EmailChangeRequest', EmailChangeRequestSchema);

