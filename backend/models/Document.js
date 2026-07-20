import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['Lead', 'Contact', 'Company', 'Deal', 'Meeting', 'Campaign', 'Task', 'Quote', 'Product', 'DealItem']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID reference is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    category: {
      type: String,
      enum: ['General', 'Product Images', 'Datasheets', 'Manuals', 'Technical Specifications', 'Certificates', 'Warranty Documents', 'Contract', 'Invoice', 'Proposal'],
      default: 'General'
    },
    uploadedBy: {
      type: String,
      default: 'Jane Doe',
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Document', DocumentSchema);
