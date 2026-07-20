import mongoose from 'mongoose';

const SavedFilterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Filter name is required'],
      trim: true
    },
    module: {
      type: String,
      required: [true, 'CRM Module name is required'],
      enum: ['leads', 'contacts', 'meetings', 'campaigns']
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Filter parameters are required']
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('SavedFilter', SavedFilterSchema);
