import { BaseRepository } from './BaseRepository.js';
import Contact from '../models/Contact.js';

class ContactRepositoryClass extends BaseRepository {
  constructor() {
    super(Contact);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email, isDeleted: { $ne: true } });
  }

  async searchContacts(searchTerm, extraQuery = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await this.model.find({
      isDeleted: { $ne: true },
      ...extraQuery,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { contactNumber: searchRegex }
      ]
    });
  }
}

export const ContactRepository = new ContactRepositoryClass();
