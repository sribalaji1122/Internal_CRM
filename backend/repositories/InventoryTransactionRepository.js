import { BaseRepository } from './BaseRepository.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

class InventoryTransactionRepositoryClass extends BaseRepository {
  constructor() {
    super(InventoryTransaction);
  }

  async findByProductId(productId) {
    return await InventoryTransaction.find({ productId }).sort('-timestamp');
  }
}

export const InventoryTransactionRepository = new InventoryTransactionRepositoryClass();
