import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    campaignType: {
      type: String,
      required: [true, 'Campaign type is required'],
      enum: {
        values: [
          'Email Campaign',
          'LinkedIn Campaign',
          'Google Ads',
          'Meta Ads',
          'Webinar',
          'Trade Show',
          'Referral',
          'Product Launch',
          'Custom'
        ],
        message: '{VALUE} is not a valid campaign type'
      }
    },
    status: {
      type: String,
      required: [true, 'Campaign status is required'],
      enum: {
        values: ['Draft', 'Planned', 'Active', 'Paused', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid campaign status'
      },
      default: 'Draft'
    },
    budget: {
      type: Number,
      required: [true, 'Allocated budget is required'],
      min: [0, 'Budget must be positive']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value) {
          // 'this' refers to the document in validation unless using update
          if (this.startDate) {
            return value >= this.startDate;
          }
          return true;
        },
        message: 'End date cannot be earlier than start date'
      }
    },
    owner: {
      type: String,
      trim: true
    },
    associatedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
      }
    ],
    expectedRevenue: {
      type: Number,
      min: [0, 'Expected revenue must be positive']
    },
    actualRevenue: {
      type: Number,
      min: [0, 'Actual revenue must be positive']
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

// Pre-update hook to handle end date validation on updates as well
CampaignSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.endDate && update.startDate) {
    if (new Date(update.endDate) < new Date(update.startDate)) {
      return next(new Error('End date cannot be earlier than start date'));
    }
  }
  next();
});

export default mongoose.model('Campaign', CampaignSchema);
