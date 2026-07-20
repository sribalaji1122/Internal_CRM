import axios from 'axios';

const API_URL = '/api/products';

class ProductServiceClass {
  getAll(params) {
    return axios.get(API_URL, { params });
  }
  getById(id) {
    return axios.get(`${API_URL}/${id}`);
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
  bulkDelete(ids) {
    return axios.post(`${API_URL}/bulk-delete`, { ids });
  }
  bulkUpdate(ids, updates) {
    return axios.post(`${API_URL}/bulk-update`, { ids, updates });
  }
  importProducts(products) {
    return axios.post(`${API_URL}/import`, { products });
  }
  getStats(id) {
    return axios.get(`${API_URL}/${id}/stats`);
  }
  getPriceHistory(id) {
    return axios.get(`${API_URL}/${id}/price-history`);
  }
  getTransactions(id) {
    return axios.get(`${API_URL}/${id}/transactions`);
  }
}

export default new ProductServiceClass();
