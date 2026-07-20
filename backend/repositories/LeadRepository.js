import { BaseRepository } from './BaseRepository.js';
import Lead from '../models/Lead.js';

class LeadRepositoryClass extends BaseRepository {
  constructor() {
    super(Lead);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email, isDeleted: { $ne: true } });
  }

  async searchLeads(searchTerm, extraQuery = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await this.model.find({
      isDeleted: { $ne: true },
      ...extraQuery,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { leadNumber: searchRegex }
      ]
    });
  }
}

export const LeadRepository = new LeadRepositoryClass();
