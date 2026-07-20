import express from 'express';
import {
  getAnalyticsKpis,
  getRoleDashboard,
  getForecasts
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/kpis', getAnalyticsKpis);
router.get('/role-dashboard/:role', getRoleDashboard);
router.get('/forecast', getForecasts);

export default router;
