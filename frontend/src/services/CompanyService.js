import api from './api';

const CompanyService = {
  // GET /api/companies
  getCompanies(params) {
    return api.get('/companies', { params });
  },

  // GET /api/companies/:id
  getCompany(id) {
    return api.get(`/companies/${id}`);
  },

  // POST /api/companies
  createCompany(data) {
    return api.post('/companies', data);
  },

  // PUT /api/companies/:id
  updateCompany(id, data) {
    return api.put(`/companies/${id}`, data);
  },

  // DELETE /api/companies/:id
  deleteCompany(id) {
    return api.delete(`/companies/${id}`);
  },

  // Related Entities Sub-Endpoints
  getLeads(id, params) {
    return api.get(`/companies/${id}/leads`, { params });
  },

  getContacts(id, params) {
    return api.get(`/companies/${id}/contacts`, { params });
  },

  getDeals(id, params) {
    return api.get(`/companies/${id}/deals`, { params });
  },

  getMeetings(id, params) {
    return api.get(`/companies/${id}/meetings`, { params });
  },

  getCampaigns(id, params) {
    return api.get(`/companies/${id}/campaigns`, { params });
  },

  getDocuments(id, params) {
    return api.get(`/companies/${id}/documents`, { params });
  },

  getActivity(id, params) {
    return api.get(`/companies/${id}/activity`, { params });
  }
};

export default CompanyService;
