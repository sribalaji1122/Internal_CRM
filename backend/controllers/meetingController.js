import { MeetingService } from '../services/MeetingService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllMeetings = async (req, res, next) => {
  try {
    const { search, status, meetingType, date, page, limit, sort, relatedLeadId, relatedContactId } = req.query;
    const result = await MeetingService.getAllMeetings({
      search,
      status,
      meetingType,
      date,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort,
      relatedLeadId,
      relatedContactId
    });

    return ApiResponse.success(res, {
      message: 'Meetings fetched successfully',
      data: result.meetings,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetingById = async (req, res, next) => {
  try {
    const meeting = await MeetingService.getMeetingById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Meeting fetched successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

export const createMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingService.createMeeting(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Meeting scheduled successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingService.updateMeeting(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Meeting updated successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    await MeetingService.deleteMeeting(req.params.id);
    return ApiResponse.success(res, {
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
