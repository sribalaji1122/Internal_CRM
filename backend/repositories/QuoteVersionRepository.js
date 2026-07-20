import { BaseRepository } from './BaseRepository.js';
import QuoteVersion from '../models/QuoteVersion.js';

class QuoteVersionRepositoryClass extends BaseRepository {
  constructor() {
    super(QuoteVersion);
  }

  async findByQuoteId(quoteId) {
    return await QuoteVersion.find({ quoteId }).sort('-versionNumber');
  }
}

export const QuoteVersionRepository = new QuoteVersionRepositoryClass();
