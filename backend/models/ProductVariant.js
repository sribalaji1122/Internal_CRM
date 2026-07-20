import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    variantCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      index: true
    },
    barcode: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    version: {
      type: String,
      default: '1.0'
    },
    priceOverride: {
      type: Number,
      default: null
    },
    costOverride: {
      type: Number,
      default: null
    },
    stockQuantity: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Out of Stock', 'Discontinued'],
      default: 'Active'
    },
    images: [{ type: String }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
