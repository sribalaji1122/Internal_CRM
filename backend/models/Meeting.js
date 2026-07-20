import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    relatedType: {
      type: String,
      required: [true, 'Related type is required'],
      enum: {
        values: ['Lead', 'Contact'],
        message: '{VALUE} is not a valid related type'
      }
    },
    relatedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [
        function() {
          return this.relatedType === 'Lead';
        },
        'Related lead reference is required when related type is Lead'
      ]
    },
    relatedContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: [
        function() {
          return this.relatedType === 'Contact';
        },
        'Related contact reference is required when related type is Contact'
      ]
    },
    meetingDate: {
      type: Date,
      required: [true, 'Meeting date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      trim: true
    },
    meetingType: {
      type: String,
      required: [true, 'Meeting type is required'],
      enum: {
        values: ['Online', 'Phone Call', 'Video Conference', 'In Person', 'Customer Visit', 'Internal Discussion'],
        message: '{VALUE} is not a valid meeting type'
      }
    },
    status: {
      type: String,
      required: [true, 'Meeting status is required'],
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Missed'],
        message: '{VALUE} is not a valid meeting status'
      },
      default: 'Scheduled'
    },
    location: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    },
    agenda: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Meeting', MeetingSchema);
