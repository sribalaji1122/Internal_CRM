import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory'
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory'
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductBrand'
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      default: 0
    },
    costPrice: {
      type: Number,
      default: 0
    },
    taxPercentage: {
      type: Number,
      default: 0
    },
    unitOfMeasure: {
      type: String,
      default: 'PCS'
    },
    // Inventory Foundation Structure
    stockQuantity: {
      type: Number,
      default: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0
    },
    availableQuantity: {
      type: Number,
      default: 0
    },
    minimumStock: {
      type: Number,
      default: 5
    },
    maximumStock: {
      type: Number,
      default: 500
    },
    reorderLevel: {
      type: Number,
      default: 10
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
      default: 'In Stock'
    },
    isActive: {
      type: Boolean,
      default: true
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

// Virtual calculation for available quantity
ProductSchema.pre('save', function (next) {
  this.availableQuantity = Math.max(0, (this.stockQuantity || 0) - (this.reservedQuantity || 0));
  if (this.stockQuantity <= 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.stockQuantity <= this.reorderLevel) {
    this.stockStatus = 'Low Stock';
  } else {
    this.stockStatus = 'In Stock';
  }
  next();
});

export default mongoose.model('Product', ProductSchema);
