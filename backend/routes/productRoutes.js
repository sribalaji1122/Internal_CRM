import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  importProducts,
  getProductStats,
  getProductPriceHistory,
  getProductTransactions
} from '../controllers/productController.js';

const router = express.Router();

router.post('/bulk-delete', bulkDeleteProducts);
router.post('/bulk-update', bulkUpdateProducts);
router.post('/import', importProducts);

router.route('/')
  .get(getAllProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

router.get('/:id/stats', getProductStats);
router.get('/:id/price-history', getProductPriceHistory);
router.get('/:id/transactions', getProductTransactions);

export default router;
