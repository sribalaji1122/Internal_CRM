import mongoose from 'mongoose';

const ApprovalHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Manager Approval', 'Finance Approval', 'Approved', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      required: true
    },
    approvedBy: {
      type: String,
      default: 'System User'
    },
    approvedAt: {
      type: Date,
      default: Date.now
    },
    approvalLevel: {
      type: String,
      enum: ['L1_Manager', 'L2_Finance', 'Executive', 'General'],
      default: 'General'
    },
    comments: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: [true, 'Quote number is required'],
      unique: true,
      trim: true
    },
    versionNumber: {
      type: Number,
      default: 1
    },
    subject: {
      type: String,
      required: [true, 'Quote subject is required'],
      trim: true
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Manager Approval', 'Finance Approval', 'Approved', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      default: 'Draft'
    },
    subtotal: {
      type: Number,
      default: 0
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    taxTotal: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: ''
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date
    },
    termsAndConditions: {
      type: String,
      default: 'Standard 30 days payment terms apply.'
    },
    notes: {
      type: String,
      default: ''
    },
    preparedBy: {
      type: String,
      default: 'Jane Doe'
    },
    approvedBy: {
      type: String,
      default: ''
    },
    approvalHistory: [ApprovalHistorySchema],
    createdBy: {
      type: String,
      default: 'Jane Doe'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: String
  },
  { timestamps: true }
);

export default mongoose.model('Quote', QuoteSchema);
