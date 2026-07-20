import express from 'express';
import {
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter
} from '../controllers/savedFilterController.js';

const router = express.Router();

router.route('/')
  .get(getSavedFilters)
  .post(createSavedFilter);

router.route('/:id')
  .delete(deleteSavedFilter);

export default router;
