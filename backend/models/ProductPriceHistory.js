import mongoose from 'mongoose';

const productPriceHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    oldPrice: {
      type: Number,
      required: true
    },
    newPrice: {
      type: Number,
      required: true
    },
    changedBy: {
      type: String,
      default: 'System'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: 'Price Update'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  {
    timestamps: true
  }
);

const ProductPriceHistory = mongoose.model('ProductPriceHistory', productPriceHistorySchema);
export default ProductPriceHistory;
