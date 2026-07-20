import api from './api';

// Encapsulates Meeting REST calls
const MeetingService = {
  // Get all meetings (supports query params: search, status, meetingType, date, page, limit, sort, relatedLeadId, relatedContactId)
  getMeetings(params) {
    return api.get('/meetings', { params });
  },

  // Get a single meeting by ID
  getMeeting(id) {
    return api.get(`/meetings/${id}`);
  },

  // Create a new meeting
  createMeeting(meetingData) {
    return api.post('/meetings', meetingData);
  },

  // Update a meeting by ID
  updateMeeting(id, meetingData) {
    return api.put(`/meetings/${id}`, meetingData);
  },

  // Delete a meeting by ID
  deleteMeeting(id) {
    return api.delete(`/meetings/${id}`);
  }
};

export default MeetingService;
