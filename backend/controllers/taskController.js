import { TaskService } from '../services/TaskService.js';
import Task from '../models/Task.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const { search, status, priority, taskType, assignedTo, page, limit, sort } = req.query;
    const result = await TaskService.getAllTasks({
      search,
      status,
      priority,
      taskType,
      assignedTo,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Tasks fetched successfully',
      data: result.tasks,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Task fetched successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = getTaskById;

export const createTask = async (req, res, next) => {
  try {
    const task = await TaskService.createTask(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await TaskService.deleteTask(req.params.id);
    return ApiResponse.success(res, {
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    const newStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    const updated = await TaskService.updateTask(req.params.id, { status: newStatus });

    return ApiResponse.success(res, {
      message: `Task marked as ${newStatus}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const updated = await TaskService.updateTask(req.params.id, { status: 'Completed' });
    return ApiResponse.success(res, { message: 'Task marked as Completed', data: updated });
  } catch (error) {
    next(error);
  }
};

export const reopenTask = async (req, res, next) => {
  try {
    const updated = await TaskService.updateTask(req.params.id, { status: 'In Progress' });
    return ApiResponse.success(res, { message: 'Task reopened', data: updated });
  } catch (error) {
    next(error);
  }
};

export const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) return ApiResponse.error(res, { statusCode: 400, message: 'AssignedTo is required' });

    const updated = await TaskService.updateTask(req.params.id, { assignedTo });
    return ApiResponse.success(res, {
      message: `Task reassigned to ${assignedTo}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateTask = async (req, res, next) => {
  try {
    const orig = await TaskService.getTaskById(req.params.id);
    const dupData = {
      ...orig,
      title: `${orig.title} (Copy)`,
      status: 'Not Started'
    };
    delete dupData.id;
    delete dupData.taskNumber;

    const dup = await TaskService.createTask(dupData);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Task duplicated successfully',
      data: dup
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateTasks = async (req, res, next) => {
  try {
    const { ids, status, priority, assignedTo } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assignedTo) updates.assignedTo = assignedTo;

    for (const id of ids) {
      await TaskService.updateTask(id, updates);
    }
    return ApiResponse.success(res, { message: `${ids.length} Tasks updated successfully` });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteTasks = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    for (const id of ids) {
      await TaskService.deleteTask(id);
    }
    return ApiResponse.success(res, { message: `${ids.length} Tasks deleted successfully` });
  } catch (error) {
    next(error);
  }
};

export const getTaskSummary = async (req, res, next) => {
  try {
    const total = await Task.countDocuments({ isDeleted: { $ne: true } });
    const completed = await Task.countDocuments({ status: 'Completed', isDeleted: { $ne: true } });
    const overdue = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'Completed' }, isDeleted: { $ne: true } });
    return ApiResponse.success(res, {
      data: { total, completed, overdue }
    });
  } catch (error) {
    next(error);
  }
};
