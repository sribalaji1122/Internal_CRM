import { LeadService } from '../services/LeadService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllLeads = async (req, res, next) => {
  try {
    const { search, status, leadSource, page, limit, sort } = req.query;
    const result = await LeadService.getAllLeads({
      search,
      status,
      leadSource,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Leads fetched successfully',
      data: result.leads,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await LeadService.getLeadById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Lead fetched successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const lead = await LeadService.createLead(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await LeadService.updateLead(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    await LeadService.deleteLead(req.params.id);
    return ApiResponse.success(res, {
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req, res, next) => {
  try {
    const result = await LeadService.convertLead(req.params.id);
    return ApiResponse.success(res, {
      message: 'Lead converted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteLeads = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    for (const id of ids) {
      await LeadService.deleteLead(id);
    }
    return ApiResponse.success(res, { message: `${ids.length} Leads deleted successfully` });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateLeads = async (req, res, next) => {
  try {
    const { ids, status, owner } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    const updates = {};
    if (status) updates.status = status;
    if (owner) updates.owner = owner;

    for (const id of ids) {
      await LeadService.updateLead(id, updates);
    }
    return ApiResponse.success(res, { message: `${ids.length} Leads updated successfully` });
  } catch (error) {
    next(error);
  }
};

export const importLeads = async (req, res, next) => {
  try {
    const { leads } = req.body;
    if (!leads || !Array.isArray(leads)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Leads dataset list is required' });
    }

    const createdLeads = [];
    const errors = [];

    for (let i = 0; i < leads.length; i++) {
      const lData = leads[i];
      if (!lData.firstName || !lData.lastName || !lData.email || !lData.company) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }
      try {
        const lead = await LeadService.createLead(lData);
        createdLeads.push(lead);
      } catch (err) {
        errors.push(`Row ${i + 1}: Save failed - ${err.message}`);
      }
    }

    return ApiResponse.success(res, {
      message: `Import completed. ${createdLeads.length} leads created.`,
      data: { createdCount: createdLeads.length, errors }
    });
  } catch (error) {
    next(error);
  }
};
