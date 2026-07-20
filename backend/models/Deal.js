import mongoose from 'mongoose';

// Auto-generate deal number: DEAL-XXXX
function generateDealNumber() {
  return 'DEAL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const DealSchema = new mongoose.Schema(
  {
    dealName: {
      type: String,
      required: [true, 'Deal name is required'],
      trim: true
    },
    dealNumber: {
      type: String,
      unique: true,
      default: generateDealNumber
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'A company must be associated with the deal']
    },
    primaryContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    pipeline: {
      type: String,
      enum: {
        values: ['Default Pipeline'],
        message: '{VALUE} is not a valid pipeline'
      },
      default: 'Default Pipeline'
    },
    stage: {
      type: String,
      enum: {
        values: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Contract', 'Won', 'Lost'],
        message: '{VALUE} is not a valid stage'
      },
      default: 'Prospecting'
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Won', 'Lost', 'Cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Open'
    },
    owner: {
      type: String,
      trim: true,
      default: 'Jane Doe'
    },
    currency: { type: String, default: 'USD' },
    dealValue: {
      type: Number,
      min: [0, 'Deal value cannot be negative'],
      default: 0
    },
    expectedRevenue: { type: Number, min: 0, default: 0 },
    actualRevenue: { type: Number, min: 0, default: 0 },
    probability: {
      type: Number,
      min: [0, 'Probability must be between 0 and 100'],
      max: [100, 'Probability must be between 0 and 100'],
      default: 10
    },
    expectedCloseDate: {
      type: Date,
      required: [true, 'Expected close date is required']
    },
    actualCloseDate: { type: Date },
    competitor: { type: String, trim: true },
    source: { type: String, trim: true },
    description: { type: String, trim: true },
    nextAction: { type: String, trim: true },
    nextFollowUp: { type: Date },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Deal', DealSchema);
