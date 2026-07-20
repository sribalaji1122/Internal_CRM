import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    transactionType: {
      type: String,
      enum: ['Purchase', 'Sale', 'Reservation', 'Release', 'Adjustment', 'Return', 'Transfer'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    currentStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    createdBy: {
      type: String,
      default: 'Jane Doe'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
