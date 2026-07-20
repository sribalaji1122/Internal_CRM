import api from './api';

// Encapsulates Lead REST calls
const LeadService = {
  // Get all leads (supports query params: search, status, leadSource, page, limit, sort)
  getLeads(params) {
    return api.get('/leads', { params });
  },

  // Get a single lead by ID
  getLead(id) {
    return api.get(`/leads/${id}`);
  },

  // Create a new lead record
  createLead(leadData) {
    return api.post('/leads', leadData);
  },

  // Update an existing lead record by ID
  updateLead(id, leadData) {
    return api.put(`/leads/${id}`, leadData);
  },

  // Delete a lead record by ID
  deleteLead(id) {
    return api.delete(`/leads/${id}`);
  },

  // Bulk delete leads (expects { ids: [] })
  bulkDeleteLeads({ ids }) {
    return api.post('/leads/bulk-delete', { ids });
  },

  // Bulk update leads (expects { ids, status, owner })
  bulkUpdateLeads({ ids, status, owner }) {
    return api.post('/leads/bulk-update', { ids, status, owner });
  }
};

export default LeadService;
