import api from './api';

// Encapsulates Dashboard REST calls
const DashboardService = {
  // Get all aggregated dashboard overview metrics
  getOverview() {
    return api.get('/dashboard/overview');
  }
};

export default DashboardService;
