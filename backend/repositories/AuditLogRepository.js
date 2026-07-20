import { BaseRepository } from './BaseRepository.js';
import AuditLog from '../models/AuditLog.js';

class AuditLogRepositoryClass extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async findByEntity(entityType, entityId) {
    return await AuditLog.find({ entityType, entityId }).sort('-timestamp');
  }
}

export const AuditLogRepository = new AuditLogRepositoryClass();
