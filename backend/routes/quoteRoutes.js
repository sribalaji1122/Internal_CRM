import express from 'express';
import {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuoteStatus,
  cloneQuote,
  archiveQuote,
  emailQuote,
  convertToSalesOrder,
  getQuotePdfHtml,
  bulkApproveQuotes,
  checkQuoteExpiries
} from '../controllers/quoteController.js';

const router = express.Router();

router.post('/bulk-approve', bulkApproveQuotes);
router.post('/check-expiries', checkQuoteExpiries);

router.route('/')
  .get(getAllQuotes)
  .post(createQuote);

router.route('/:id')
  .get(getQuoteById);

router.put('/:id/status', updateQuoteStatus);
router.post('/:id/clone', cloneQuote);
router.put('/:id/archive', archiveQuote);
router.post('/:id/email', emailQuote);
router.post('/:id/convert-to-order', convertToSalesOrder);
router.get('/:id/pdf', getQuotePdfHtml);

export default router;
