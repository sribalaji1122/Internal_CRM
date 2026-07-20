import api from './api';

const TaskService = {
  getTasks(params) {
    return api.get('/tasks', { params });
  },
  getTask(id) {
    return api.get(`/tasks/${id}`);
  },
  createTask(data) {
    return api.post('/tasks', data);
  },
  updateTask(id, data) {
    return api.put(`/tasks/${id}`, data);
  },
  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },
  completeTask(id) {
    return api.put(`/tasks/${id}/complete`);
  },
  reopenTask(id) {
    return api.put(`/tasks/${id}/reopen`);
  },
  assignTask(id, data) {
    return api.put(`/tasks/${id}/assign`, data);
  },
  duplicateTask(id) {
    return api.post(`/tasks/${id}/duplicate`);
  },
  bulkUpdateTasks(data) {
    return api.put('/tasks/bulk-update', data);
  },
  bulkDeleteTasks(data) {
    return api.put('/tasks/bulk-delete', data);
  },
  getTaskSummary() {
    return api.get('/tasks/summary');
  },

  // Comments
  getComments(taskId) {
    return api.get(`/tasks/${taskId}/comments`);
  },
  addComment(taskId, data) {
    return api.post(`/tasks/${taskId}/comments`, data);
  },
  updateComment(taskId, commentId, data) {
    return api.put(`/tasks/${taskId}/comments/${commentId}`, data);
  },
  deleteComment(taskId, commentId) {
    return api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Checklist
  getChecklist(taskId) {
    return api.get(`/tasks/${taskId}/checklist`);
  },
  addChecklistItem(taskId, data) {
    return api.post(`/tasks/${taskId}/checklist`, data);
  },
  toggleChecklistItem(taskId, itemId) {
    return api.put(`/tasks/${taskId}/checklist/${itemId}/toggle`);
  },
  updateChecklistItem(taskId, itemId, data) {
    return api.put(`/tasks/${taskId}/checklist/${itemId}`, data);
  },
  deleteChecklistItem(taskId, itemId) {
    return api.delete(`/tasks/${taskId}/checklist/${itemId}`);
  }
};

export default TaskService;
