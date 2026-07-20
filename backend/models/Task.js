import mongoose from 'mongoose';

// Auto-generate task number: TASK-XXXXXX
function generateTaskNumber() {
  return 'TASK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const TaskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      unique: true,
      default: generateTaskNumber
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'Medium'
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Pending'
    },
    type: {
      type: String,
      enum: {
        values: ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Proposal', 'Documentation', 'Internal', 'Custom'],
        message: '{VALUE} is not a valid task type'
      },
      default: 'Internal'
    },
    assignedTo: {
      type: String,
      trim: true,
      default: 'Jane Doe'
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'Jane Doe'
    },

    // Entity relationships (all optional, future-ready)
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal'
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting'
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },

    // Sub-task / hierarchy support
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },

    // Task dependency: this task is blocked by another task
    dependsOn: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],

    // Scheduling
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    startDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },

    // Effort tracking
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0
    },
    progress: {
      type: Number,
      min: [0, 'Progress must be between 0 and 100'],
      max: [100, 'Progress must be between 0 and 100'],
      default: 0
    },

    // Reminders & recurrence
    reminder: {
      type: Date
    },
    repeat: {
      type: String,
      enum: ['None', 'Daily', 'Weekly', 'Monthly'],
      default: 'None'
    },

    // Attachments & metadata
    attachments: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true
    },

    // Soft-delete
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for performance on common queries
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ companyId: 1 });
TaskSchema.index({ dealId: 1 });
TaskSchema.index({ isDeleted: 1 });

export default mongoose.model('Task', TaskSchema);
