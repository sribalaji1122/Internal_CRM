import { CalendarService } from '../services/CalendarService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return ApiResponse.error(res, { statusCode: 400, message: 'start and end query params are required' });
    }

    const events = await CalendarService.getEventsInRange(start, end);
    return ApiResponse.success(res, {
      message: 'Calendar events fetched successfully',
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const getDayEvents = async (req, res, next) => {
  try {
    const day = new Date(req.params.date);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await CalendarService.getEventsInRange(dayStart, dayEnd);
    return ApiResponse.success(res, { message: 'Day events fetched', data: events });
  } catch (error) {
    next(error);
  }
};

export const getWeekEvents = async (req, res, next) => {
  try {
    const day = new Date(req.params.date);
    const weekStart = new Date(day);
    weekStart.setDate(day.getDate() - day.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const events = await CalendarService.getEventsInRange(weekStart, weekEnd);
    return ApiResponse.success(res, { message: 'Week events fetched', data: events });
  } catch (error) {
    next(error);
  }
};

export const getMonthEvents = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10) - 1;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const events = await CalendarService.getEventsInRange(monthStart, monthEnd);
    return ApiResponse.success(res, { message: 'Month events fetched', data: events });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await CalendarService.createEvent(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await CalendarService.updateEvent(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await CalendarService.deleteEvent(req.params.id);
    return ApiResponse.success(res, {
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await CalendarService.getEventsInRange(new Date(0), new Date(2100, 0, 1));
    const matched = events.find(e => String(e.id) === req.params.id);
    return ApiResponse.success(res, { data: matched || {} });
  } catch (error) {
    next(error);
  }
};
