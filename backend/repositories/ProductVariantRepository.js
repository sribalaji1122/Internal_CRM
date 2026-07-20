import { BaseRepository } from './BaseRepository.js';
import ProductVariant from '../models/ProductVariant.js';

class ProductVariantRepositoryClass extends BaseRepository {
  constructor() {
    super(ProductVariant);
  }

  async findByProductId(productId) {
    return await this.findAll({ productId });
  }

  async findBySku(sku) {
    return await this.findOne({ sku });
  }
}

export const ProductVariantRepository = new ProductVariantRepositoryClass();
