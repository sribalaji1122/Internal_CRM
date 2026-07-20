import { BaseRepository } from './BaseRepository.js';
import Deal from '../models/Deal.js';

class DealRepositoryClass extends BaseRepository {
  constructor() {
    super(Deal);
  }

  async findByCompanyId(companyId) {
    return await this.model.find({ companyId, isDeleted: { $ne: true } }).sort('-createdAt');
  }

  async searchDeals(searchTerm, extraQuery = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await this.model.find({
      isDeleted: { $ne: true },
      ...extraQuery,
      $or: [
        { dealName: searchRegex },
        { dealNumber: searchRegex },
        { owner: searchRegex },
        { source: searchRegex }
      ]
    }).populate('companyId', 'companyName');
  }
}

export const DealRepository = new DealRepositoryClass();
