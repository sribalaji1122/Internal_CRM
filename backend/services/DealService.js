import { DealRepository } from '../repositories/DealRepository.js';
import { DealDTO } from '../dtos/DealDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class DealServiceClass {
  async getAllDeals({ search, stage, status, pipeline, page = 1, limit = 10, sort = '-createdAt' }) {
    const query = {};
    if (stage && stage !== 'ALL') query.stage = stage;
    if (status && status !== 'ALL') query.status = status;
    if (pipeline && pipeline !== 'ALL') query.pipeline = pipeline;

    let deals;
    let total;

    if (search) {
      deals = await DealRepository.searchDeals(search, query);
      total = deals.length;
    } else {
      const skip = (page - 1) * limit;
      deals = await DealRepository.findAll({ query, sort, skip, limit, populate: [{ path: 'companyId', select: 'companyName' }] });
      total = await DealRepository.count(query);
    }

    return {
      deals: DealDTO.transformMany(deals),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getDealById(id) {
    const deal = await DealRepository.findById(id, [
      { path: 'companyId', select: 'companyName email phone' },
      { path: 'primaryContactId', select: 'firstName lastName email phone' },
      { path: 'leadId', select: 'firstName lastName company' }
    ]);
    if (!deal) throw new Error(`Deal not found with ID: ${id}`);
    return DealDTO.transform(deal);
  }

  async createDeal(data) {
    // Sanitize optional ObjectIds
    ['primaryContactId', 'leadId', 'actualCloseDate', 'nextFollowUp'].forEach(field => {
      if (!data[field]) data[field] = null;
    });

    // Record initial stage in history
    if (data.stage) {
      data.stageHistory = [{
        stage: data.stage,
        changedAt: new Date(),
        changedBy: data.owner || 'Jane Doe',
        durationInStage: 0
      }];
    }

    const deal = await DealRepository.create(data);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.DEAL_CREATED, {
      entityType: 'Deal',
      entityId: deal._id,
      description: `New Deal "${deal.dealName}" created with value $${deal.amount || 0}.`,
      notificationTitle: 'New Deal Created'
    });

    return DealDTO.transform(deal);
  }

  async updateDeal(id, data) {
    const existing = await DealRepository.findById(id);
    if (!existing) throw new Error(`Deal not found with ID: ${id}`);

    // Clean optional ObjectId fields
    ['primaryContactId', 'leadId', 'actualCloseDate', 'nextFollowUp'].forEach(field => {
      if (data[field] === '') data[field] = null;
    });

    // Automated Stage Transition Detection
    if (data.stage && data.stage !== existing.stage) {
      const prevStageObj = existing.stageHistory && existing.stageHistory.length > 0
        ? existing.stageHistory[existing.stageHistory.length - 1]
        : null;

      const prevTime = prevStageObj ? new Date(prevStageObj.changedAt).getTime() : new Date(existing.createdAt).getTime();
      const durationHours = Math.round((Date.now() - prevTime) / (1000 * 60 * 60));

      const newHistoryItem = {
        stage: data.stage,
        changedAt: new Date(),
        changedBy: data.owner || 'Jane Doe',
        durationInStage: durationHours
      };

      data.stageHistory = [...(existing.stageHistory || []), newHistoryItem];

      // Automatic Status Updates
      if (data.stage === 'Closed Won' || data.stage === 'Won') {
        data.status = 'Won';
        data.actualCloseDate = new Date();
      } else if (data.stage === 'Closed Lost' || data.stage === 'Lost') {
        data.status = 'Lost';
        data.actualCloseDate = new Date();
      }

      // Trigger Workflow Stage Change Event
      const eventType = data.status === 'Won' ? ACTIVITY_TYPES.DEAL_WON : data.status === 'Lost' ? ACTIVITY_TYPES.DEAL_LOST : ACTIVITY_TYPES.DEAL_STAGE_CHANGED;

      await WorkflowEngine.triggerWorkflowEvent(eventType, {
        entityType: 'Deal',
        entityId: existing._id,
        description: `Deal "${existing.dealName}" stage updated from "${existing.stage}" to "${data.stage}".`,
        notificationTitle: `Deal Stage Updated to ${data.stage}`,
        notificationType: data.status === 'Won' ? 'success' : data.status === 'Lost' ? 'warning' : 'info'
      });
    }

    const updated = await DealRepository.updateById(id, data);
    return DealDTO.transform(updated);
  }

  async deleteDeal(id, user = 'System User') {
    const deal = await DealRepository.softDelete(id, user);
    if (!deal) throw new Error(`Deal not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.DEAL_DELETED, {
      entityType: 'Deal',
      entityId: id,
      description: `Deal ID ${id} was soft-deleted.`
    });

    return true;
  }
}

export const DealService = new DealServiceClass();
