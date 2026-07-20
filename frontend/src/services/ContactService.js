import api from './api';

// Encapsulates Contact REST calls and Lead-to-Contact conversion
const ContactService = {
  // Get all contacts (supports search, filters, pagination, sort)
  getContacts(params) {
    return api.get('/contacts', { params });
  },

  // Get a single contact by ID (includes populated lead details)
  getContact(id) {
    return api.get(`/contacts/${id}`);
  },

  // Create a new contact
  createContact(contactData) {
    return api.post('/contacts', contactData);
  },

  // Update a contact by ID
  updateContact(id, contactData) {
    return api.put(`/contacts/${id}`, contactData);
  },

  // Delete a contact by ID
  deleteContact(id) {
    return api.delete(`/contacts/${id}`);
  },

  // Convert a qualified lead to a contact
  convertLead(leadId) {
    return api.post(`/leads/${leadId}/convert`);
  }
};

export default ContactService;
