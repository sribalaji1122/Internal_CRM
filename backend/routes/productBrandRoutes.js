import express from 'express';
import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/productBrandController.js';

const router = express.Router();

router.route('/')
  .get(getAllBrands)
  .post(createBrand);

router.route('/:id')
  .put(updateBrand)
  .delete(deleteBrand);

export default router;
