import api from './api';

const DocumentService = {
  // GET /api/documents/:entityType/:entityId
  getDocuments(entityType, entityId) {
    return api.get(`/documents/${entityType}/${entityId}`);
  },

  // POST /api/documents
  uploadDocument(data) {
    return api.post('/documents', data);
  },

  // DELETE /api/documents/:id
  deleteDocument(id) {
    return api.delete(`/documents/${id}`);
  }
};

export default DocumentService;
