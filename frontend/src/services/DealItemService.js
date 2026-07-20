import axios from 'axios';

const API_URL = '/api/deal-items';

class DealItemServiceClass {
  getByDealId(dealId) {
    return axios.get(`${API_URL}/deal/${dealId}`);
  }
  create(data) {
    return axios.post(API_URL, data);
  }
  update(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }
  delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

export default new DealItemServiceClass();
