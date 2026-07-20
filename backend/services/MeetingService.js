import { MeetingRepository } from '../repositories/MeetingRepository.js';
import { CalendarRepository } from '../repositories/CalendarRepository.js';
import { MeetingDTO } from '../dtos/MeetingDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class MeetingServiceClass {
  async syncMeetingToCalendar(meeting) {
    try {
      const existing = await CalendarRepository.model.findOne({ entityType: 'Meeting', entityId: meeting._id });
      const eventData = {
        title: meeting.title,
        description: meeting.description,
        entityType: 'Meeting',
        entityId: meeting._id,
        start: meeting.meetingDate,
        end: meeting.meetingDate,
        allDay: false,
        color: '#6366f1',
        status: meeting.status === 'Cancelled' ? 'Cancelled' : 'Scheduled',
        location: meeting.location,
        notes: meeting.notes,
        createdBy: meeting.createdBy || 'Jane Doe'
      };

      if (existing) {
        await CalendarRepository.updateById(existing._id, eventData);
      } else {
        await CalendarRepository.create(eventData);
      }
    } catch (err) {
      console.error('Failed to sync meeting to calendar event:', err);
    }
  }

  async getAllMeetings({ search, status, meetingType, date, page = 1, limit = 10, sort = '-meetingDate -startTime', relatedLeadId, relatedContactId }) {
    const query = {};
    if (relatedLeadId) query.relatedLeadId = relatedLeadId;
    if (relatedContactId) query.relatedContactId = relatedContactId;
    if (status && status !== 'ALL') query.status = status;
    if (meetingType && meetingType !== 'ALL') query.meetingType = meetingType;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.meetingDate = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;
    const meetings = await MeetingRepository.findAll({
      query,
      sort,
      skip,
      limit,
      populate: [
        { path: 'relatedLeadId', select: 'firstName lastName company' },
        { path: 'relatedContactId', select: 'firstName lastName company' }
      ]
    });
    const total = await MeetingRepository.count(query);

    return {
      meetings: MeetingDTO.transformMany(meetings),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getMeetingById(id) {
    const meeting = await MeetingRepository.findById(id, [
      { path: 'relatedLeadId', select: 'firstName lastName company email phone' },
      { path: 'relatedContactId', select: 'firstName lastName company email phone' }
    ]);
    if (!meeting) throw new Error(`Meeting not found with ID: ${id}`);
    return MeetingDTO.transform(meeting);
  }

  async createMeeting(data) {
    if (data.relatedType === 'Lead') data.relatedContactId = null;
    if (data.relatedType === 'Contact') data.relatedLeadId = null;

    const meeting = await MeetingRepository.create(data);
    await this.syncMeetingToCalendar(meeting);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.MEETING_SCHEDULED, {
      entityType: 'Meeting',
      entityId: meeting._id,
      description: `Meeting "${meeting.title}" scheduled for ${new Date(meeting.meetingDate).toLocaleDateString()} at ${meeting.startTime}.`,
      notificationTitle: 'Meeting Scheduled'
    });

    return MeetingDTO.transform(meeting);
  }

  async updateMeeting(id, data) {
    if (data.relatedType === 'Lead') data.relatedContactId = null;
    if (data.relatedType === 'Contact') data.relatedLeadId = null;

    const meeting = await MeetingRepository.updateById(id, data);
    if (!meeting) throw new Error(`Meeting not found with ID: ${id}`);

    await this.syncMeetingToCalendar(meeting);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.MEETING_UPDATED, {
      entityType: 'Meeting',
      entityId: meeting._id,
      description: `Meeting "${meeting.title}" details updated.`
    });

    return MeetingDTO.transform(meeting);
  }

  async deleteMeeting(id) {
    const meeting = await MeetingRepository.deleteById(id);
    if (!meeting) throw new Error(`Meeting not found with ID: ${id}`);

    await CalendarRepository.model.deleteOne({ entityType: 'Meeting', entityId: id });

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.MEETING_CANCELLED, {
      entityType: 'Meeting',
      entityId: id,
      description: `Meeting ID ${id} deleted.`
    });

    return true;
  }
}

export const MeetingService = new MeetingServiceClass();
