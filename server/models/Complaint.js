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
    name: { type: String, default: 'Railway Officer' },
    department: { type: String, default: 'Railway Department' },
    role: { type: String, default: 'Station Grievance Cell' }
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
    type: [Number], // [x, y, width, height] percentage or coords
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
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
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
    address: { type: String, default: 'Railway Station Premises' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  attachments: {
    images: [{ type: String }],
    videos: [{ type: String }],
    audio: [{ type: String }]
  },
  aiAnalysis: {
    detectedObjects: [DetectedObjectSchema],
    confidence: { type: Number, default: 0.92 },
    predictedCategory: { type: String },
    predictedUrgency: { type: String },
    summary: { type: String },
    modelVersion: { type: String, default: 'Mock-AI-Pipeline-v1.0 (YOLO/LLM Ready)' }
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
    escalatedTo: { type: String, default: 'Divisional Railway Manager (DRM) Grievance Cell' }
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

// Helper static to generate formatted sequential or timestamp ID
ComplaintSchema.statics.generateComplaintId = async function (deptCode = 'RLY') {
  const currentYear = new Date().getFullYear();
  const count = await this.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `${deptCode}-${currentYear}-${seq}`;
};

export const Complaint = mongoose.model('Complaint', ComplaintSchema);
