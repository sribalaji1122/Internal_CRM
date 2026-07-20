import { ProductPriceHistoryRepository } from '../repositories/ProductPriceHistoryRepository.js';

class ProductPriceHistoryServiceClass {
  async recordPriceChange({ productId, oldPrice, newPrice, changedBy = 'Jane Doe', reason = 'Price updated', currency = 'USD' }) {
    if (oldPrice === newPrice) return null;
    return await ProductPriceHistoryRepository.create({
      productId,
      oldPrice,
      newPrice,
      changedBy,
      reason,
      currency,
      changedAt: new Date()
    });
  }

  async getHistoryByProductId(productId) {
    return await ProductPriceHistoryRepository.findByProductId(productId);
  }
}

export const ProductPriceHistoryService = new ProductPriceHistoryServiceClass();
