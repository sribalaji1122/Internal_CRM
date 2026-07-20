import TaskComment from '../models/TaskComment.js';

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Public
export const getComments = async (req, res, next) => {
  try {
    const comments = await TaskComment.find({ taskId: req.params.taskId })
      .sort('-createdAt');
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Public
export const addComment = async (req, res, next) => {
  try {
    const comment = await TaskComment.create({
      taskId: req.params.taskId,
      user: req.body.user || 'Jane Doe',
      comment: req.body.comment
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/tasks/:taskId/comments/:commentId
// @access  Public
export const updateComment = async (req, res, next) => {
  try {
    const comment = await TaskComment.findByIdAndUpdate(
      req.params.commentId,
      { comment: req.body.comment },
      { new: true, runValidators: true }
    );
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @access  Public
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await TaskComment.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
