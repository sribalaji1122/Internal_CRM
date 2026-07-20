import axios from 'axios';

const API_URL = '/api/inventory';

class InventoryServiceClass {
  getSummary() {
    return axios.get(`${API_URL}/summary`);
  }
  adjustStock(data) {
    return axios.post(`${API_URL}/adjust`, data);
  }
  reserveStock(data) {
    return axios.post(`${API_URL}/reserve`, data);
  }
  releaseStock(data) {
    return axios.post(`${API_URL}/release`, data);
  }
}

export default new InventoryServiceClass();
