import { InventoryTransactionRepository } from '../repositories/InventoryTransactionRepository.js';
import Product from '../models/Product.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class InventoryTransactionServiceClass {
  async recordTransaction({ productId, transactionType, quantity, reason = '', createdBy = 'Jane Doe' }) {
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product not found with ID: ${productId}`);

    const previousStock = product.stockQuantity;
    let newStock = previousStock;

    if (['Purchase', 'Return', 'Release'].includes(transactionType)) {
      newStock += quantity;
    } else if (['Sale', 'Reservation', 'Adjustment'].includes(transactionType)) {
      newStock -= quantity;
    }

    if (newStock < 0) newStock = 0;

    // Update Product Stock & Status
    product.stockQuantity = newStock;
    product.availableQuantity = Math.max(0, newStock - (product.reservedQuantity || 0));

    if (product.stockQuantity <= 0) {
      product.stockStatus = 'Out of Stock';
    } else if (product.stockQuantity <= (product.reorderLevel || 5)) {
      product.stockStatus = 'Low Stock';
    } else {
      product.stockStatus = 'In Stock';
    }

    await product.save();

    // Log Transaction
    const transaction = await InventoryTransactionRepository.create({
      productId,
      transactionType,
      quantity,
      previousStock,
      currentStock: newStock,
      reason,
      createdBy,
      timestamp: new Date()
    });

    // Check Inventory Alerts
    if (product.stockStatus === 'Low Stock' || product.stockStatus === 'Out of Stock') {
      await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.PRODUCT_UPDATED, {
        entityType: 'Product',
        entityId: productId,
        description: `Inventory Alert: Product "${product.name}" is now ${product.stockStatus} (Stock: ${product.stockQuantity}).`,
        notificationTitle: `Inventory Alert: ${product.stockStatus}`
      });
    }

    return transaction;
  }

  async getTransactionsByProductId(productId) {
    return await InventoryTransactionRepository.findByProductId(productId);
  }
}

export const InventoryTransactionService = new InventoryTransactionServiceClass();
