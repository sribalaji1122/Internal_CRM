import Product from '../models/Product.js';
import { InventoryTransactionService } from './InventoryTransactionService.js';

class InventoryReservationServiceClass {
  async reserveStock({ productId, quantity, dealId = null, createdBy = 'Jane Doe', reason = 'Deal Reservation' }) {
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product not found with ID: ${productId}`);

    if (product.availableQuantity < quantity) {
      throw new Error(`Insufficient stock available for reservation. Available: ${product.availableQuantity}, Requested: ${quantity}`);
    }

    product.reservedQuantity = (product.reservedQuantity || 0) + quantity;
    product.availableQuantity = Math.max(0, product.stockQuantity - product.reservedQuantity);
    await product.save();

    await InventoryTransactionService.recordTransaction({
      productId,
      transactionType: 'Reservation',
      quantity,
      reason: `Reserved for Deal ${dealId || ''}: ${reason}`,
      createdBy
    });

    return {
      productId,
      stockQuantity: product.stockQuantity,
      reservedQuantity: product.reservedQuantity,
      availableQuantity: product.availableQuantity
    };
  }

  async releaseReservation({ productId, quantity, createdBy = 'Jane Doe', reason = 'Reservation Released' }) {
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product not found with ID: ${productId}`);

    product.reservedQuantity = Math.max(0, (product.reservedQuantity || 0) - quantity);
    product.availableQuantity = Math.max(0, product.stockQuantity - product.reservedQuantity);
    await product.save();

    await InventoryTransactionService.recordTransaction({
      productId,
      transactionType: 'Release',
      quantity,
      reason,
      createdBy
    });

    return {
      productId,
      stockQuantity: product.stockQuantity,
      reservedQuantity: product.reservedQuantity,
      availableQuantity: product.availableQuantity
    };
  }
}

export const InventoryReservationService = new InventoryReservationServiceClass();
