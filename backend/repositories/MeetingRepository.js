import { BaseRepository } from './BaseRepository.js';
import Meeting from '../models/Meeting.js';

class MeetingRepositoryClass extends BaseRepository {
  constructor() {
    super(Meeting);
  }
}

export const MeetingRepository = new MeetingRepositoryClass();
