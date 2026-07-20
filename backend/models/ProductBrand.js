import mongoose from 'mongoose';

const ProductBrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    website: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('ProductBrand', ProductBrandSchema);
