import express from 'express';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  bulkDeleteLeads,
  bulkUpdateLeads,
  importLeads
} from '../controllers/leadController.js';

const router = express.Router();

router.route('/')
  .get(getAllLeads)
  .post(createLead);

router.post('/bulk-delete', bulkDeleteLeads);
router.post('/bulk-update', bulkUpdateLeads);
router.post('/import', importLeads);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

router.post('/:id/convert', convertLead);

export default router;
