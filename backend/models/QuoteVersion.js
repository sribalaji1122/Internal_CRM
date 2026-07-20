import mongoose from 'mongoose';

const quoteVersionSchema = new mongoose.Schema(
  {
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1
    },
    createdBy: {
      type: String,
      default: 'Jane Doe'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: 'Quote Revision'
    },
    status: {
      type: String,
      default: 'Draft'
    },
    payloadSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const QuoteVersion = mongoose.model('QuoteVersion', quoteVersionSchema);
export default QuoteVersion;
