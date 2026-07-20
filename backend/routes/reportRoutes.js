import express from 'express';
import {
  getSalesReport,
  getProductReport,
  getCustomerReport,
  exportReport,
  scheduleReport
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/sales', getSalesReport);
router.get('/products', getProductReport);
router.get('/customers', getCustomerReport);
router.post('/export', exportReport);
router.post('/schedule', scheduleReport);

export default router;
