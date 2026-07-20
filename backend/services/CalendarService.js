import { CalendarRepository } from '../repositories/CalendarRepository.js';
import Meeting from '../models/Meeting.js';
import Deal from '../models/Deal.js';
import Campaign from '../models/Campaign.js';
import { CalendarEventDTO } from '../dtos/CalendarEventDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

const EVENT_COLORS = {
  Meeting: '#6366f1',
  Task: '#f59e0b',
  Deal: '#10b981',
  Campaign: '#f43f5e',
  FollowUp: '#06b6d4',
  Holiday: '#8b5cf6',
  CompanyEvent: '#3b82f6',
  Birthday: '#ec4899',
  Standalone: '#64748b'
};

class CalendarServiceClass {
  async getEventsInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const storedEvents = await CalendarRepository.findAll({
      query: {
        start: { $gte: start, $lte: end },
        status: { $ne: 'Cancelled' }
      }
    });

    const syncedMeetingIds = storedEvents
      .filter(e => e.entityType === 'Meeting')
      .map(e => e.entityId?.toString());

    const meetings = await Meeting.find({
      meetingDate: { $gte: start, $lte: end },
      status: { $ne: 'Cancelled' }
    }).lean();

    const meetingEvents = meetings
      .filter(m => !syncedMeetingIds.includes(m._id.toString()))
      .map(m => ({
        id: m._id,
        title: m.title,
        start: m.meetingDate,
        end: m.meetingDate,
        allDay: false,
        type: 'Meeting',
        color: EVENT_COLORS.Meeting,
        entityType: 'Meeting',
        entityId: m._id,
        status: m.status,
        location: m.location
      }));

    const syncedDealIds = storedEvents
      .filter(e => e.entityType === 'Deal')
      .map(e => e.entityId?.toString());

    const deals = await Deal.find({
      expectedCloseDate: { $gte: start, $lte: end },
      status: { $in: ['Open', 'In Progress'] }
    }).lean();

    const dealEvents = deals
      .filter(d => !syncedDealIds.includes(d._id.toString()))
      .map(d => ({
        id: d._id,
        title: `Deal Close: ${d.dealName}`,
        start: d.expectedCloseDate,
        end: d.expectedCloseDate,
        allDay: true,
        type: 'Deal',
        color: EVENT_COLORS.Deal,
        entityType: 'Deal',
        entityId: d._id,
        status: d.status
      }));

    const normalizedStored = CalendarEventDTO.transformMany(storedEvents);
    const normalizedDynamic = CalendarEventDTO.transformMany([...meetingEvents, ...dealEvents]);

    return [...normalizedStored, ...normalizedDynamic].sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  async createEvent(data) {
    const event = await CalendarRepository.create(data);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CALENDAR_EVENT_ADDED, {
      entityType: 'CalendarEvent',
      entityId: event._id,
      description: `Calendar event "${event.title}" created.`,
      notificationTitle: 'Event Added to Calendar'
    });

    return CalendarEventDTO.transform(event);
  }

  async updateEvent(id, data) {
    const event = await CalendarRepository.updateById(id, data);
    if (!event) throw new Error(`Calendar event not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CALENDAR_EVENT_UPDATED, {
      entityType: 'CalendarEvent',
      entityId: event._id,
      description: `Calendar event "${event.title}" updated.`,
      notificationTitle: 'Calendar Event Updated'
    });

    return CalendarEventDTO.transform(event);
  }

  async deleteEvent(id) {
    const event = await CalendarRepository.deleteById(id);
    if (!event) throw new Error(`Calendar event not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.CALENDAR_EVENT_DELETED, {
      entityType: 'CalendarEvent',
      entityId: id,
      description: `Calendar event ID ${id} deleted.`
    });

    return true;
  }
}

export const CalendarService = new CalendarServiceClass();
