import mongoose from 'mongoose';

const ProgressUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      'Submitted',
      'Under Review',
      'Accepted',
      'In Progress',
      'Resolved',
      'Disputed',
      'Escalated',
      'Closed'
    ]
  },
  message: {
    type: String,
    required: true
  },
  officer: {
    name: { type: String, default: 'Department Officer' },
    department: { type: String, default: 'Public Service Department' },
    role: { type: String, default: 'Grievance Redressal Officer' }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  media: [{
    type: String
  }]
});

const DetectedObjectSchema = new mongoose.Schema({
  label: { type: String, required: true },
  confidence: { type: Number, required: true },
  bbox: {
    type: [Number],
    default: [20, 25, 60, 50]
  }
}, { _id: false });

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  citizenId: {
    type: String,
    default: 'CITIZEN-DEMO-001',
    index: true
  },
  citizenDetails: {
    name: { type: String, default: 'Citizen' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  generatedProblemStatement: {
    type: String,
    default: ''
  },
  // Alias for backward compatibility with existing code
  aiGeneratedDescription: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Problem category is required'],
    index: true
  },
  department: {
    id: { type: String, default: 'railway', index: true },
    code: { type: String, default: 'RLY' },
    name: { type: String, default: 'Railway Department' }
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  location: {
    address: { type: String, default: 'Public Premises' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  attachments: {
    images: [{ type: String }],
    videos: [{ type: String }],
    audio: [{ type: String }]
  },
  evidence: [{
    url: { type: String },
    type: { type: String, default: 'image' },
    caption: { type: String, default: '' }
  }],
  aiAnalysis: {
    detectedObjects: [DetectedObjectSchema],
    confidence: { type: Number, default: 0.92 },
    predictedCategory: { type: String },
    predictedUrgency: { type: String },
    summary: { type: String },
    modelVersion: { type: String, default: 'JanSahayata-AI-Pipeline-v2.0' }
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Under Review',
      'Accepted',
      'In Progress',
      'Resolved',
      'Disputed',
      'Escalated',
      'Closed'
    ],
    default: 'Submitted',
    index: true
  },
  assignedEmployee: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' }
  },
  investigationNotes: {
    type: String,
    default: ''
  },
  progressUpdates: [ProgressUpdateSchema],
  dispute: {
    isDisputed: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    media: [{ type: String }],
    createdAt: { type: Date, default: null }
  },
  escalation: {
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date, default: null },
    escalationReason: { type: String, default: '' },
    previousStatus: { type: String, default: '' },
    escalatedTo: { type: String, default: 'Divisional Grievance Cell' }
  },
  resolution: {
    notes: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    officer: { type: String, default: '' },
    media: [{ type: String }]
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    feedback: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Helper static to generate formatted dynamic complaint ID (e.g. JNS-2026-000001 or RLY-2026-000001)
ComplaintSchema.statics.generateComplaintId = async function (deptCode = 'JNS') {
  const currentYear = new Date().getFullYear();
  const count = await this.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  const prefix = deptCode || 'JNS';
  return `${prefix}-${currentYear}-${seq}`;
};

export const Complaint = mongoose.model('Complaint', ComplaintSchema);
