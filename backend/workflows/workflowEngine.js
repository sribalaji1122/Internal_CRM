import ActivityLog from '../models/ActivityLog.js';
import { createSystemNotification } from '../controllers/notificationController.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

export class WorkflowEngine {
  /**
   * Trigger a workflow event across system channels
   * @param {string} eventName - Standardized activity type or event identifier
   * @param {object} payload - Metadata including entityType, entityId, description, user, details
   */
  static async triggerWorkflowEvent(eventName, payload = {}) {
    const {
      entityType = 'System',
      entityId = null,
      description = '',
      user = 'System User',
      metadata = {}
    } = payload;

    try {
      // 1. Create ActivityLog Entry
      if (entityType && entityId) {
        await ActivityLog.create({
          activityType: eventName,
          entityType,
          entityId,
          user,
          description: description || `Workflow event ${eventName} triggered`
        });
      }

      // 2. Generate System Notification
      const notifTitle = payload.notificationTitle || eventName.replace(/_/g, ' ');
      const notifDesc = description || `Event ${eventName} completed successfully.`;
      const notifType = payload.notificationType || 'info';

      await createSystemNotification(notifTitle, notifDesc, notifType);

      // 3. Email Dispatcher (Stub for Phase 13C+)
      await this._dispatchEmailStub(eventName, payload);

      // 4. Task Generation Automation (Stub for Phase 13C+)
      await this._autoGenerateNextTaskStub(eventName, payload);

      // 5. Webhook Dispatcher (Stub for Phase 13C+)
      await this._dispatchWebhookStub(eventName, payload);

      return { success: true, eventName };
    } catch (err) {
      console.error(`[WorkflowEngine Error] Failed to trigger event ${eventName}:`, err);
      return { success: false, error: err.message };
    }
  }

  static async _dispatchEmailStub(eventName, payload) {
    // Interface for future SMTP / SendGrid / Resend email integration
    // console.log(`[Workflow Engine Stub - Email] Triggered for ${eventName}`);
  }

  static async _autoGenerateNextTaskStub(eventName, payload) {
    // Interface for automated follow-up task generation (e.g. Stage -> Negotiation auto task)
    // console.log(`[Workflow Engine Stub - Next Task] Triggered for ${eventName}`);
  }

  static async _dispatchWebhookStub(eventName, payload) {
    // Interface for Zapier / Make / Enterprise Webhooks
    // console.log(`[Workflow Engine Stub - Webhook] Triggered for ${eventName}`);
  }
}
