import express from 'express';
import {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting
} from '../controllers/meetingController.js';

const router = express.Router();

router.route('/')
  .get(getAllMeetings)
  .post(createMeeting);

router.route('/:id')
  .get(getMeetingById)
  .put(updateMeeting)
  .delete(deleteMeeting);

export default router;
