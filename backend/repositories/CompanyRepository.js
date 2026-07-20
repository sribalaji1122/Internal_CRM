import { BaseRepository } from './BaseRepository.js';
import Company from '../models/Company.js';

class CompanyRepositoryClass extends BaseRepository {
  constructor() {
    super(Company);
  }

  async findByName(companyName) {
    return await this.model.findOne({
      companyName: new RegExp(`^${companyName}$`, 'i'),
      isDeleted: { $ne: true }
    });
  }

  async searchCompanies(searchTerm, extraQuery = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await this.model.find({
      isDeleted: { $ne: true },
      ...extraQuery,
      $or: [
        { companyName: searchRegex },
        { companyCode: searchRegex },
        { industry: searchRegex },
        { email: searchRegex }
      ]
    });
  }
}

export const CompanyRepository = new CompanyRepositoryClass();
