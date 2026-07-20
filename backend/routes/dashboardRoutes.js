import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/overview
router.get('/overview', getDashboardOverview);

export default router;
