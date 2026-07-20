import { BaseRepository } from './BaseRepository.js';
import Task from '../models/Task.js';

class TaskRepositoryClass extends BaseRepository {
  constructor() {
    super(Task);
  }

  async findDueToday() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return await this.model.find({
      dueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'Completed' },
      isDeleted: { $ne: true }
    });
  }

  async findOverdue() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return await this.model.find({
      dueDate: { $lt: todayStart },
      status: { $ne: 'Completed' },
      isDeleted: { $ne: true }
    });
  }
}

export const TaskRepository = new TaskRepositoryClass();
