import { BaseRepository } from './BaseRepository.js';
import ProductPriceHistory from '../models/ProductPriceHistory.js';

class ProductPriceHistoryRepositoryClass extends BaseRepository {
  constructor() {
    super(ProductPriceHistory);
  }

  async findByProductId(productId) {
    return await ProductPriceHistory.find({ productId }).sort('-changedAt');
  }
}

export const ProductPriceHistoryRepository = new ProductPriceHistoryRepositoryClass();
