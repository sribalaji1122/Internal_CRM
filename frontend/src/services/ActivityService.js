import api from './api';

const ActivityService = {
  // GET /api/activity/company/:id
  getCompanyActivity(companyId, params) {
    return api.get(`/activity/company/${companyId}`, { params });
  },

  // GET /api/activity/deal/:id
  getDealActivity(dealId, params) {
    return api.get(`/activity/deal/${dealId}`, { params });
  }
};

export default ActivityService;
