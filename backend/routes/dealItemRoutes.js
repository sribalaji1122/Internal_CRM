import express from 'express';
import {
  getItemsByDealId,
  createDealItem,
  updateDealItem,
  deleteDealItem
} from '../controllers/dealItemController.js';

const router = express.Router();

router.get('/deal/:dealId', getItemsByDealId);
router.post('/', createDealItem);
router.route('/:id')
  .put(updateDealItem)
  .delete(deleteDealItem);

export default router;
