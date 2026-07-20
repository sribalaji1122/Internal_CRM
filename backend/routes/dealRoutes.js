import express from 'express';
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealPipelineSummary
} from '../controllers/dealController.js';

const router = express.Router();

router.get('/pipeline-summary', getDealPipelineSummary);

router.route('/')
  .get(getAllDeals)
  .post(createDeal);

router.route('/:id')
  .get(getDealById)
  .put(updateDeal)
  .delete(deleteDeal);

export default router;
