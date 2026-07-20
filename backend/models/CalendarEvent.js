import mongoose from 'mongoose';

// Auto-generate event ID: EVT-XXXXXX
function generateEventId() {
  return 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const CalendarEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
      default: generateEventId
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },

    // Source entity linkage
    entityType: {
      type: String,
      enum: {
        values: ['Meeting', 'Task', 'Deal', 'Campaign', 'Holiday', 'CompanyEvent', 'Birthday', 'FollowUp', 'Standalone'],
        message: '{VALUE} is not a valid entity type'
      },
      default: 'Standalone'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },

    // Timing
    start: {
      type: Date,
      required: [true, 'Start date/time is required']
    },
    end: {
      type: Date
    },
    allDay: {
      type: Boolean,
      default: false
    },

    // Visual
    color: {
      type: String,
      default: '#6366f1',
      trim: true
    },

    // Recurrence
    recurrence: {
      type: String,
      enum: ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
      default: 'None'
    },

    // Status
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled', 'Tentative'],
        message: '{VALUE} is not a valid event status'
      },
      default: 'Scheduled'
    },

    // Metadata
    location: {
      type: String,
      trim: true
    },
    attendees: [{
      type: String,
      trim: true
    }],
    reminder: {
      type: Number, // minutes before event
      default: 15
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'Jane Doe'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for date-range queries
CalendarEventSchema.index({ start: 1, end: 1 });
CalendarEventSchema.index({ entityType: 1, entityId: 1 });
CalendarEventSchema.index({ status: 1 });

export default mongoose.model('CalendarEvent', CalendarEventSchema);
