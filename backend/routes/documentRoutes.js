import express from 'express';
import { getDocumentsByEntity, uploadDocument, deleteDocument } from '../controllers/documentController.js';

const router = express.Router();

router.get('/:entityType/:entityId', getDocumentsByEntity);
router.post('/', uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
