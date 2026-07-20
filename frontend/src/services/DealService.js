import api from './api';

const DealService = {
  // GET /api/deals
  getDeals(params) {
    return api.get('/deals', { params });
  },

  // GET /api/deals/pipeline-summary
  getPipelineSummary() {
    return api.get('/deals/pipeline-summary');
  },

  // GET /api/deals/:id
  getDeal(id) {
    return api.get(`/deals/${id}`);
  },

  // POST /api/deals
  createDeal(data) {
    return api.post('/deals', data);
  },

  // PUT /api/deals/:id
  updateDeal(id, data) {
    return api.put(`/deals/${id}`, data);
  },

  // DELETE /api/deals/:id
  deleteDeal(id) {
    return api.delete(`/deals/${id}`);
  }
};

export default DealService;
