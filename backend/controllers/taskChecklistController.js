import TaskChecklist from '../models/TaskChecklist.js';

// @desc    Get all checklist items for a task
// @route   GET /api/tasks/:taskId/checklist
// @access  Public
export const getChecklist = async (req, res, next) => {
  try {
    const items = await TaskChecklist.find({ taskId: req.params.taskId })
      .sort('sortOrder');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add checklist item
// @route   POST /api/tasks/:taskId/checklist
// @access  Public
export const addChecklistItem = async (req, res, next) => {
  try {
    const lastItem = await TaskChecklist.findOne({ taskId: req.params.taskId })
      .sort('-sortOrder');
    const sortOrder = lastItem ? lastItem.sortOrder + 1 : 0;

    const item = await TaskChecklist.create({
      taskId: req.params.taskId,
      text: req.body.text,
      sortOrder
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle checklist item completion
// @route   PUT /api/tasks/:taskId/checklist/:itemId/toggle
// @access  Public
export const toggleChecklistItem = async (req, res, next) => {
  try {
    const item = await TaskChecklist.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    item.isCompleted = !item.isCompleted;
    item.completedAt = item.isCompleted ? new Date() : null;
    item.completedBy = item.isCompleted ? (req.body.user || 'Jane Doe') : null;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update checklist item text
// @route   PUT /api/tasks/:taskId/checklist/:itemId
// @access  Public
export const updateChecklistItem = async (req, res, next) => {
  try {
    const item = await TaskChecklist.findByIdAndUpdate(
      req.params.itemId,
      { text: req.body.text },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete checklist item
// @route   DELETE /api/tasks/:taskId/checklist/:itemId
// @access  Public
export const deleteChecklistItem = async (req, res, next) => {
  try {
    const item = await TaskChecklist.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }
    res.status(200).json({ success: true, message: 'Checklist item deleted' });
  } catch (error) {
    next(error);
  }
};
