import mongoose from 'mongoose';

const ProductCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null // Null for root Category, populates for Sub Category
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

export default mongoose.model('ProductCategory', ProductCategorySchema);
