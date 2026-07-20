import express from 'express';
import {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant
} from '../controllers/productVariantController.js';

const router = express.Router();

router.get('/product/:productId', getVariantsByProduct);
router.post('/', createVariant);
router.route('/:id')
  .put(updateVariant)
  .delete(deleteVariant);

export default router;
