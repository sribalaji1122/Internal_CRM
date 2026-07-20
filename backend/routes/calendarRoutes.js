import express from 'express';
import {
  getEvents,
  getDayEvents,
  getWeekEvents,
  getMonthEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent
} from '../controllers/calendarController.js';

const router = express.Router();

// Unified event queries
router.get('/events', getEvents);
router.get('/day/:date', getDayEvents);
router.get('/week/:date', getWeekEvents);
router.get('/month/:year/:month', getMonthEvents);

// CRUD for standalone calendar events
router.post('/events', createEvent);
router.get('/events/:id', getEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
