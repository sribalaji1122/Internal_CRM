import { BaseRepository } from './BaseRepository.js';
import Campaign from '../models/Campaign.js';

class CampaignRepositoryClass extends BaseRepository {
  constructor() {
    super(Campaign);
  }
}

export const CampaignRepository = new CampaignRepositoryClass();
