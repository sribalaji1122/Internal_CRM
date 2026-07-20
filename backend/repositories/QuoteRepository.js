import { BaseRepository } from './BaseRepository.js';
import Quote from '../models/Quote.js';

class QuoteRepositoryClass extends BaseRepository {
  constructor() {
    super(Quote);
  }

  async findRecent(limit = 5) {
    return await this.model.find({ isDeleted: { $ne: true } }).sort('-createdAt').limit(limit);
  }
}

export const QuoteRepository = new QuoteRepositoryClass();
