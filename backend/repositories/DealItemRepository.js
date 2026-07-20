import { BaseRepository } from './BaseRepository.js';
import DealItem from '../models/DealItem.js';

class DealItemRepositoryClass extends BaseRepository {
  constructor() {
    super(DealItem);
  }

  async findByDealId(dealId) {
    return await this.model.find({ dealId, isDeleted: { $ne: true } }).sort('sortOrder');
  }
}

export const DealItemRepository = new DealItemRepositoryClass();
