import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  bulkUpdateContacts,
  importContacts
} from '../controllers/contactController.js';

const router = express.Router();

router.route('/')
  .get(getAllContacts)
  .post(createContact);

router.post('/bulk-delete', bulkDeleteContacts);
router.post('/bulk-update', bulkUpdateContacts);
router.post('/import', importContacts);

router.route('/:id')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

export default router;
