import { BaseRepository } from './BaseRepository.js';
import CalendarEvent from '../models/CalendarEvent.js';

class CalendarRepositoryClass extends BaseRepository {
  constructor() {
    super(CalendarEvent);
  }
}

export const CalendarRepository = new CalendarRepositoryClass();
