import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    jobTitle: {
      type: String,
      trim: true
    },
    leadSource: {
      type: String,
      enum: {
        values: ['Web Referral', 'Direct Outreach', 'Partner Referral', 'Cold Email', 'Other'],
        message: '{VALUE} is not a valid lead source'
      },
      default: 'Other'
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Lost'],
        message: '{VALUE} is not a valid lead status'
      },
      default: 'New'
    },
    notes: {
      type: String,
      trim: true
    },
    isConverted: {
      type: Boolean,
      default: false
    },
    convertedContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Lead', LeadSchema);
