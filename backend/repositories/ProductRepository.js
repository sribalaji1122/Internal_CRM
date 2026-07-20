import { BaseRepository } from './BaseRepository.js';
import Product from '../models/Product.js';

class ProductRepositoryClass extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findLowStock() {
    return await this.model.find({
      stockStatus: 'Low Stock',
      isDeleted: { $ne: true }
    });
  }
}

export const ProductRepository = new ProductRepositoryClass();
