import express from 'express';
import { getCompanyActivity, getDealActivity } from '../controllers/activityController.js';

const router = express.Router();

router.get('/company/:id', getCompanyActivity);
router.get('/deal/:id', getDealActivity);

export default router;
