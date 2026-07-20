import mongoose from 'mongoose';
import { DiscountEngine } from '../utils/discountEngine.js';
import { TaxEngine } from '../utils/taxEngine.js';

const DealItemSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: [true, 'Deal reference is required'],
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      default: 0
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxPercent: {
      type: Number,
      default: 18
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    lineTotal: {
      type: Number,
      default: 0
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Pre-save calculation using DiscountEngine and TaxEngine
DealItemSchema.pre('save', function (next) {
  const discountRes = DiscountEngine.calculateLineDiscount({
    unitPrice: this.unitPrice,
    quantity: this.quantity,
    discountPercent: this.discountPercent,
    discountAmount: this.discountAmount
  });

  this.discountAmount = discountRes.discountAmount;

  const taxRes = TaxEngine.calculateLineTax({
    amountAfterDiscount: discountRes.netAmount,
    taxPercent: this.taxPercent
  });

  this.taxAmount = taxRes.taxAmount;
  this.lineTotal = taxRes.lineTotal;
  next();
});

export default mongoose.model('DealItem', DealItemSchema);
