import api from './api';

const CalendarService = {
  getEvents(params) {
    return api.get('/calendar/events', { params });
  },
  getDayEvents(date) {
    return api.get(`/calendar/day/${date}`);
  },
  getWeekEvents(date) {
    return api.get(`/calendar/week/${date}`);
  },
  getMonthEvents(year, month) {
    return api.get(`/calendar/month/${year}/${month}`);
  },
  createEvent(data) {
    return api.post('/calendar/events', data);
  },
  getEvent(id) {
    return api.get(`/calendar/events/${id}`);
  },
  updateEvent(id, data) {
    return api.put(`/calendar/events/${id}`, data);
  },
  deleteEvent(id) {
    return api.delete(`/calendar/events/${id}`);
  }
};

export default CalendarService;
