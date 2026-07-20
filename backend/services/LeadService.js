import { LeadRepository } from '../repositories/LeadRepository.js';
import { ContactRepository } from '../repositories/ContactRepository.js';
import { LeadDTO } from '../dtos/LeadDTO.js';
import { WorkflowEngine } from '../workflows/workflowEngine.js';
import { ACTIVITY_TYPES } from '../constants/activityTypes.js';

class LeadServiceClass {
  async getAllLeads({ search, status, leadSource, page = 1, limit = 10, sort = '-createdAt' }) {
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (leadSource && leadSource !== 'ALL') query.leadSource = leadSource;

    let leads;
    let total;

    if (search) {
      leads = await LeadRepository.searchLeads(search, query);
      total = leads.length;
    } else {
      const skip = (page - 1) * limit;
      leads = await LeadRepository.findAll({ query, sort, skip, limit });
      total = await LeadRepository.count(query);
    }

    return {
      leads: LeadDTO.transformMany(leads),
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        recordsPerPage: limit
      }
    };
  }

  async getLeadById(id) {
    const lead = await LeadRepository.findById(id);
    if (!lead) throw new Error(`Lead not found with ID: ${id}`);
    return LeadDTO.transform(lead);
  }

  async createLead(data) {
    const lead = await LeadRepository.create(data);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.LEAD_CREATED, {
      entityType: 'Lead',
      entityId: lead._id,
      description: `Lead "${lead.firstName} ${lead.lastName}" has been added for ${lead.company}.`,
      notificationTitle: 'New Lead Created'
    });

    return LeadDTO.transform(lead);
  }

  async updateLead(id, data) {
    const lead = await LeadRepository.updateById(id, data);
    if (!lead) throw new Error(`Lead not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.LEAD_UPDATED, {
      entityType: 'Lead',
      entityId: lead._id,
      description: `Lead "${lead.firstName} ${lead.lastName}" was updated.`
    });

    return LeadDTO.transform(lead);
  }

  async deleteLead(id, user = 'System User') {
    const lead = await LeadRepository.softDelete(id, user);
    if (!lead) throw new Error(`Lead not found with ID: ${id}`);

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.LEAD_DELETED, {
      entityType: 'Lead',
      entityId: id,
      description: `Lead ID ${id} was deleted.`
    });

    return true;
  }

  async convertLead(id) {
    const lead = await LeadRepository.findById(id);
    if (!lead) throw new Error(`Lead not found with ID: ${id}`);
    if (lead.isConverted) throw new Error('Lead has already been converted to a contact');
    if (lead.status !== 'Qualified') throw new Error('Only qualified leads can be converted to contacts');

    const contact = await ContactRepository.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      jobTitle: lead.jobTitle,
      contactSource: lead.leadSource,
      originalLeadId: lead._id
    });

    await LeadRepository.updateById(id, {
      isConverted: true,
      convertedContactId: contact._id
    });

    await WorkflowEngine.triggerWorkflowEvent(ACTIVITY_TYPES.LEAD_CONVERTED, {
      entityType: 'Lead',
      entityId: lead._id,
      description: `Lead "${lead.firstName} ${lead.lastName}" converted to Contact profile.`,
      notificationTitle: 'Lead Converted'
    });

    return { contact, lead: LeadDTO.transform(lead) };
  }
}

export const LeadService = new LeadServiceClass();
