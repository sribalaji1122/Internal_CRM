import api from './api';

const SavedFilterService = {
  // GET /api/saved-filters?module=leads
  getSavedFilters(moduleName) {
    const params = {};
    if (moduleName) params.module = moduleName;
    return api.get('/saved-filters', { params });
  },

  // POST /api/saved-filters
  createSavedFilter(data) {
    return api.post('/saved-filters', data);
  },

  // DELETE /api/saved-filters/:id
  deleteSavedFilter(id) {
    return api.delete(`/saved-filters/${id}`);
  }
};

export default SavedFilterService;
