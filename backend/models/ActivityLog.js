import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: [
        'Lead Created',
        'Lead Updated',
        'Lead Converted',
        'Company Updated',
        'Deal Created',
        'Deal Updated',
        'Meeting Scheduled',
        'Campaign Added',
        'Document Uploaded',
        'Quote Generated',
        'Task Completed',
        'Task Created',
        'Task Updated',
        'Task Assigned',
        'Task Deleted',
        'Task Reopened',
        'Calendar Event Added',
        'Calendar Event Updated',
        'Calendar Event Deleted'
      ]
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['Lead', 'Contact', 'Company', 'Deal', 'Meeting', 'Campaign', 'Quote', 'Product', 'Task', 'Document', 'CalendarEvent']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required']
    },
    actor: {
      type: String,
      default: 'Jane Doe',
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    meta: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);
