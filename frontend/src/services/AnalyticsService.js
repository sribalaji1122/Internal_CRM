import axios from 'axios';

const API_URL = '/api/analytics';

class AnalyticsServiceClass {
  getKpis() {
    return axios.get(`${API_URL}/kpis`);
  }
  getRoleDashboard(role) {
    return axios.get(`${API_URL}/role-dashboard/${role}`);
  }
  getForecasts() {
    return axios.get(`${API_URL}/forecast`);
  }
}

export default new AnalyticsServiceClass();
