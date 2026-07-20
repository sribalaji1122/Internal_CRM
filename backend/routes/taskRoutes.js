import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  reopenTask,
  assignTask,
  duplicateTask,
  bulkUpdateTasks,
  bulkDeleteTasks,
  getTaskSummary
} from '../controllers/taskController.js';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/taskCommentController.js';
import {
  getChecklist,
  addChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} from '../controllers/taskChecklistController.js';

const router = express.Router();

// Summary (must be before /:id)
router.get('/summary', getTaskSummary);

// Bulk operations (must be before /:id)
router.put('/bulk-update', bulkUpdateTasks);
router.put('/bulk-delete', bulkDeleteTasks);

// Standard CRUD
router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Task actions
router.put('/:id/complete', completeTask);
router.put('/:id/reopen', reopenTask);
router.put('/:id/assign', assignTask);
router.post('/:id/duplicate', duplicateTask);

// Task comments
router.route('/:taskId/comments')
  .get(getComments)
  .post(addComment);

router.route('/:taskId/comments/:commentId')
  .put(updateComment)
  .delete(deleteComment);

// Task checklist
router.route('/:taskId/checklist')
  .get(getChecklist)
  .post(addChecklistItem);

router.put('/:taskId/checklist/:itemId/toggle', toggleChecklistItem);

router.route('/:taskId/checklist/:itemId')
  .put(updateChecklistItem)
  .delete(deleteChecklistItem);

export default router;
