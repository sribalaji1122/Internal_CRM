import { QuoteRepository } from '../repositories/QuoteRepository.js';
import { QuoteVersionRepository } from '../repositories/QuoteVersionRepository.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class QuoteServiceClass {
  async getAllQuotes(options = {}) {
    return await QuoteRepository.findWithPagination(options);
  }

  async getQuoteById(id) {
    return await QuoteRepository.findById(id);
  }

  async getRecentQuotes(limit = 5) {
    return await QuoteRepository.findRecent(limit);
  }

  async createQuote(data) {
    if (!data.quoteNumber) {
      const count = await QuoteRepository.count();
      data.quoteNumber = `QUOTE-${String(count + 10001).padStart(6, '0')}`;
    }

    if (!data.approvalHistory || data.approvalHistory.length === 0) {
      data.approvalHistory = [{
        status: data.status || 'Draft',
        approvedBy: data.createdBy || 'Jane Doe',
        approvedAt: new Date(),
        approvalLevel: 'General',
        comments: 'Initial quote creation'
      }];
    }

    const quote = await QuoteRepository.create(data);

    // Save Initial Version Snapshot
    await QuoteVersionRepository.create({
      quoteId: quote._id,
      versionNumber: 1,
      createdBy: quote.createdBy,
      reason: 'Initial Creation',
      status: quote.status,
      payloadSnapshot: quote.toObject()
    });

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.QUOTE_CREATED, {
      entityType: 'Quote',
      entityId: quote._id,
      description: `Quote "${quote.quoteNumber}" created for ${quote.subject}.`
    });

    return quote;
  }

  async updateQuoteStatus(id, newStatus, comments = '', approvedBy = 'Jane Doe', approvalLevel = 'General') {
    const existing = await QuoteRepository.findById(id);
    if (!existing) throw new Error(`Quote not found with ID: ${id}`);

    const newApproval = {
      status: newStatus,
      approvedBy,
      approvedAt: new Date(),
      approvalLevel,
      comments
    };

    const updated = await QuoteRepository.updateById(id, {
      status: newStatus,
      approvedBy: newStatus === 'Approved' ? approvedBy : existing.approvedBy,
      $push: { approvalHistory: newApproval }
    });

    let eventType = ACTIVITY_TYPES.QUOTE_SUBMITTED;
    if (newStatus === 'Approved') eventType = ACTIVITY_TYPES.QUOTE_APPROVED;

    await WorkflowEngine.triggerWorkflowEvent(eventType, {
      entityType: 'Quote',
      entityId: id,
      description: `Quote "${existing.quoteNumber}" status changed to ${newStatus}.`,
      notificationTitle: `Quote ${newStatus}`
    });

    return updated;
  }

  async cloneQuote(id) {
    const existing = await QuoteRepository.findById(id);
    if (!existing) throw new Error(`Quote not found with ID: ${id}`);

    const count = await QuoteRepository.count();
    const cloneData = {
      ...existing.toObject(),
      quoteNumber: `QUOTE-${String(count + 10001).padStart(6, '0')}`,
      versionNumber: 1,
      status: 'Draft',
      subject: `${existing.subject} (Copy)`,
      approvalHistory: [{
        status: 'Draft',
        approvedBy: 'Jane Doe',
        approvedAt: new Date(),
        approvalLevel: 'General',
        comments: `Cloned from ${existing.quoteNumber}`
      }]
    };
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;

    return await this.createQuote(cloneData);
  }

  async duplicateQuote(id) {
    return await this.cloneQuote(id);
  }

  async archiveQuote(id) {
    return await QuoteRepository.updateById(id, { status: 'Expired' });
  }

  async emailQuote(id, recipientEmail) {
    const quote = await QuoteRepository.findById(id);
    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.QUOTE_SUBMITTED, {
      entityType: 'Quote',
      entityId: id,
      description: `Quote "${quote.quoteNumber}" emailed to ${recipientEmail}.`,
      notificationTitle: `Quote Emailed`
    });
    return { success: true, message: `Quote emailed to ${recipientEmail}` };
  }

  async convertToSalesOrder(id) {
    const quote = await QuoteRepository.findById(id);
    return {
      success: true,
      message: `Quote ${quote.quoteNumber} prepared for Sales Order conversion (Placeholder)`,
      orderData: {
        orderNumber: `SO-${quote.quoteNumber.replace('QUOTE-', '')}`,
        quoteId: quote._id,
        grandTotal: quote.grandTotal,
        status: 'Order Placed'
      }
    };
  }
}

export const QuoteService = new QuoteServiceClass();
