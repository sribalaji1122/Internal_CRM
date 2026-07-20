import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: [
        'Created',
        'Updated',
        'Deleted',
        'Restored',
        'Approved',
        'Rejected',
        'Status Changed',
        'Price Changed',
        'Inventory Changed',
        'Approval Changed'
      ],
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    user: {
      type: String,
      default: 'Jane Doe'
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast audit queries
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
