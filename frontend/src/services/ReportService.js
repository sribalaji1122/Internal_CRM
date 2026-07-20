import axios from 'axios';

const API_URL = '/api/reports';

class ReportServiceClass {
  getSalesReport(params) {
    return axios.get(`${API_URL}/sales`, { params });
  }
  getProductReport(params) {
    return axios.get(`${API_URL}/products`, { params });
  }
  getCustomerReport(params) {
    return axios.get(`${API_URL}/customers`, { params });
  }
  exportReport(payload) {
    return axios.post(`${API_URL}/export`, payload, { responseType: payload.format === 'CSV' ? 'blob' : 'json' });
  }
  scheduleReport(payload) {
    return axios.post(`${API_URL}/schedule`, payload);
  }
}

export default new ReportServiceClass();
