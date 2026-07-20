import { TaskRepository } from '../repositories/TaskRepository.js';
import { CalendarRepository } from '../repositories/CalendarRepository.js';
import { TaskDTO } from '../dtos/TaskDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class TaskServiceClass {
  async syncTaskToCalendar(task) {
    try {
      const existing = await CalendarRepository.model.findOne({ entityType: 'Task', entityId: task._id });
      const eventData = {
        title: task.title,
        description: task.description,
        entityType: 'Task',
        entityId: task._id,
        start: task.dueDate,
        end: task.dueDate,
        allDay: true,
        color: task.priority === 'Critical' ? '#ef4444' : task.priority === 'High' ? '#f97316' : task.priority === 'Medium' ? '#f59e0b' : '#22c55e',
        status: task.status === 'Completed' ? 'Completed' : task.status === 'Cancelled' ? 'Cancelled' : 'Scheduled',
        createdBy: task.createdBy || 'Jane Doe'
      };

      if (existing) {
        await CalendarRepository.updateById(existing._id, eventData);
      } else {
        await CalendarRepository.create(eventData);
      }
    } catch (err) {
      console.error('Failed to sync task to calendar event:', err);
    }
  }

  async getAllTasks({ search, status, priority, taskType, assignedTo, page = 1, limit = 10, sort = '-createdAt' }) {
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (taskType && taskType !== 'ALL') query.taskType = taskType;
    if (assignedTo && assignedTo !== 'ALL') query.assignedTo = assignedTo;

    const skip = (page - 1) * limit;
    const tasks = await TaskRepository.findAll({
      query,
      sort,
      skip,
      limit,
      populate: [
        { path: 'companyId', select: 'companyName' },
        { path: 'dealId', select: 'dealName' },
        { path: 'dependsOn', select: 'title status' }
      ]
    });
    const total = await TaskRepository.count(query);

    return {
      tasks: TaskDTO.transformMany(tasks),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getTaskById(id) {
    const task = await TaskRepository.findById(id, [
      { path: 'companyId', select: 'companyName' },
      { path: 'contactId', select: 'firstName lastName email' },
      { path: 'leadId', select: 'firstName lastName company' },
      { path: 'dealId', select: 'dealName stage' },
      { path: 'meetingId', select: 'title meetingDate' },
      { path: 'dependsOn', select: 'title status priority' }
    ]);
    if (!task) throw new Error(`Task not found with ID: ${id}`);
    return TaskDTO.transform(task);
  }

  async createTask(data) {
    // Sanitize optional ObjectIds
    ['companyId', 'contactId', 'leadId', 'dealId', 'meetingId', 'campaignId', 'parentTaskId', 'reminder'].forEach(f => {
      if (!data[f]) data[f] = null;
    });

    const task = await TaskRepository.create(data);
    await this.syncTaskToCalendar(task);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.TASK_CREATED, {
      entityType: 'Task',
      entityId: task._id,
      description: `Task "${task.title}" created. Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}.`,
      notificationTitle: 'New Task Created'
    });

    return TaskDTO.transform(task);
  }

  async updateTask(id, data) {
    ['companyId', 'contactId', 'leadId', 'dealId', 'meetingId', 'campaignId', 'parentTaskId', 'reminder'].forEach(f => {
      if (data[f] === '') data[f] = null;
    });

    const task = await TaskRepository.updateById(id, data);
    if (!task) throw new Error(`Task not found with ID: ${id}`);

    await this.syncTaskToCalendar(task);

    const eventType = task.status === 'Completed' ? ACTIVITY_TYPES.TASK_COMPLETED : ACTIVITY_TYPES.TASK_UPDATED;

    await WorkflowEngine.triggerWorkflowEvent(eventType, {
      entityType: 'Task',
      entityId: task._id,
      description: `Task "${task.title}" updated. Status: ${task.status}.`,
      notificationTitle: `Task ${task.status}`
    });

    return TaskDTO.transform(task);
  }

  async deleteTask(id, user = 'System User') {
    const task = await TaskRepository.softDelete(id, user);
    if (!task) throw new Error(`Task not found with ID: ${id}`);

    await CalendarRepository.model.deleteOne({ entityType: 'Task', entityId: id });

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.TASK_DELETED, {
      entityType: 'Task',
      entityId: id,
      description: `Task ID ${id} deleted.`
    });

    return true;
  }
}

export const TaskService = new TaskServiceClass();
