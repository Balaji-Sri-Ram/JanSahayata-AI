import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  performedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    email: { type: String, default: '' },
    role: { type: String, default: 'SYSTEM' }
  },
  targetType: {
    type: String,
    enum: ['Complaint', 'User', 'Department', 'System', 'Authentication'],
    required: true
  },
  targetId: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Helper static to record an audit log easily
AuditLogSchema.statics.logAction = async function ({
  action,
  performedBy = {},
  targetType = 'System',
  targetId = '',
  details = '',
  ipAddress = '127.0.0.1',
  metadata = {}
}) {
  try {
    const log = new this({
      action,
      performedBy: {
        userId: performedBy.userId || performedBy._id || null,
        name: performedBy.name || 'System User',
        email: performedBy.email || '',
        role: performedBy.role || 'SYSTEM'
      },
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
      metadata
    });
    return await log.save();
  } catch (error) {
    console.error('[AuditLog Error]', error);
    return null;
  }
};

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
