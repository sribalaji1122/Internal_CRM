import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    revisionNumber: {
      type: Number,
      required: true,
      default: 1
    },
    fileUrl: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: String,
      default: 'Jane Doe'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: 'Revision Upload'
    },
    isLatest: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const DocumentVersion = mongoose.model('DocumentVersion', documentVersionSchema);
export default DocumentVersion;
