import { AuditLogRepository } from '../repositories/AuditLogRepository.js';

class AuditServiceClass {
  async logAction({
    entityType,
    entityId,
    action,
    oldValue = null,
    newValue = null,
    user = 'Jane Doe',
    ipAddress = '127.0.0.1',
    reason = ''
  }) {
    return await AuditLogRepository.create({
      entityType,
      entityId,
      action,
      oldValue,
      newValue,
      user,
      ipAddress,
      reason,
      timestamp: new Date()
    });
  }

  async getAuditHistory(entityType, entityId) {
    return await AuditLogRepository.findByEntity(entityType, entityId);
  }
}

export const AuditService = new AuditServiceClass();
