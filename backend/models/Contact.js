import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
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
      trim: true,
      match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number']
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
    contactSource: {
      type: String,
      enum: {
        values: ['Web Referral', 'Direct Outreach', 'Partner Referral', 'Cold Email', 'Other'],
        message: '{VALUE} is not a valid contact source'
      },
      default: 'Other'
    },
    originalLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Contact', ContactSchema);
