import api from './api';

const NotificationService = {
  // GET /api/notifications
  getNotifications() {
    return api.get('/notifications');
  },

  // GET /api/notifications/unread-count
  getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  // PUT /api/notifications/:id/read
  markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  },

  // PUT /api/notifications/read-all
  markAllAsRead() {
    return api.put('/notifications/read-all');
  }
};

export default NotificationService;
