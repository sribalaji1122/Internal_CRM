import express from 'express';
import {
  adjustStock,
  reserveStock,
  releaseStock,
  getInventorySummary
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/summary', getInventorySummary);
router.post('/adjust', adjustStock);
router.post('/reserve', reserveStock);
router.post('/release', releaseStock);

export default router;
