import axios from 'axios';

const API_URL = '/api/quotes';

class QuoteServiceClass {
  getAll(params) {
    return axios.get(API_URL, { params });
  }
  getById(id) {
    return axios.get(`${API_URL}/${id}`);
  }
  create(data) {
    return axios.post(API_URL, data);
  }
  updateStatus(id, payload) {
    return axios.put(`${API_URL}/${id}/status`, payload);
  }
  clone(id) {
    return axios.post(`${API_URL}/${id}/clone`);
  }
  archive(id) {
    return axios.put(`${API_URL}/${id}/archive`);
  }
  email(id, email) {
    return axios.post(`${API_URL}/${id}/email`, { email });
  }
  convertToOrder(id) {
    return axios.post(`${API_URL}/${id}/convert-to-order`);
  }
  getPdfHtml(id) {
    return axios.get(`${API_URL}/${id}/pdf`);
  }
  bulkApprove(ids, approvedBy) {
    return axios.post(`${API_URL}/bulk-approve`, { ids, approvedBy });
  }
  checkExpiries() {
    return axios.post(`${API_URL}/check-expiries`);
  }
}

export default new QuoteServiceClass();
