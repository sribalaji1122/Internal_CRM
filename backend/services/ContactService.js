import { ContactRepository } from '../repositories/ContactRepository.js';
import { ContactDTO } from '../dtos/ContactDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class ContactServiceClass {
  async getAllContacts({ search, page = 1, limit = 10, sort = '-createdAt' }) {
    let contacts;
    let total;

    if (search) {
      contacts = await ContactRepository.searchContacts(search);
      total = contacts.length;
    } else {
      const skip = (page - 1) * limit;
      contacts = await ContactRepository.findAll({ sort, skip, limit });
      total = await ContactRepository.count();
    }

    return {
      contacts: ContactDTO.transformMany(contacts),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getContactById(id) {
    const contact = await ContactRepository.findById(id);
    if (!contact) throw new Error(`Contact not found with ID: ${id}`);
    return ContactDTO.transform(contact);
  }

  async createContact(data) {
    const contact = await ContactRepository.create(data);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CONTACT_CREATED, {
      entityType: 'Contact',
      entityId: contact._id,
      description: `Contact "${contact.firstName} ${contact.lastName}" added.`,
      notificationTitle: 'New Contact Added'
    });

    return ContactDTO.transform(contact);
  }

  async updateContact(id, data) {
    const contact = await ContactRepository.updateById(id, data);
    if (!contact) throw new Error(`Contact not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CONTACT_UPDATED, {
      entityType: 'Contact',
      entityId: contact._id,
      description: `Contact "${contact.firstName} ${contact.lastName}" updated.`
    });

    return ContactDTO.transform(contact);
  }

  async deleteContact(id, user = 'System User') {
    const contact = await ContactRepository.softDelete(id, user);
    if (!contact) throw new Error(`Contact not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CONTACT_DELETED, {
      entityType: 'Contact',
      entityId: id,
      description: `Contact ID ${id} deleted.`
    });

    return true;
  }
}

export const ContactService = new ContactServiceClass();
