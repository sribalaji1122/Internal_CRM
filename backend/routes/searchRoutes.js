import express from 'express';
import { globalSearch } from '../controllers/searchController.js';

const router = express.Router();

// GET /api/search
router.get('/', globalSearch);

export default router;
