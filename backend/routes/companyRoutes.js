import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyLeads,
  getCompanyContacts,
  getCompanyDeals,
  getCompanyMeetings,
  getCompanyCampaigns,
  getCompanyDocuments,
  getCompanyActivityTimeline
} from '../controllers/companyController.js';

const router = express.Router();

router.route('/')
  .get(getAllCompanies)
  .post(createCompany);

router.route('/:id')
  .get(getCompanyById)
  .put(updateCompany)
  .delete(deleteCompany);

// Related Sub-Endpoints
router.get('/:id/leads', getCompanyLeads);
router.get('/:id/contacts', getCompanyContacts);
router.get('/:id/deals', getCompanyDeals);
router.get('/:id/meetings', getCompanyMeetings);
router.get('/:id/campaigns', getCompanyCampaigns);
router.get('/:id/documents', getCompanyDocuments);
router.get('/:id/activity', getCompanyActivityTimeline);

export default router;
