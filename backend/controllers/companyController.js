import { CompanyService } from '../services/CompanyService.js';
import Lead from '../models/Lead.js';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import Meeting from '../models/Meeting.js';
import Campaign from '../models/Campaign.js';
import Document from '../models/Document.js';
import ActivityLog from '../models/ActivityLog.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllCompanies = async (req, res, next) => {
  try {
    const { search, industry, tier, status, page, limit, sort } = req.query;
    const result = await CompanyService.getAllCompanies({
      search,
      industry,
      tier,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Companies fetched successfully',
      data: result.companies,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await CompanyService.getCompanyById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Company fetched successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const company = await CompanyService.createCompany(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await CompanyService.updateCompany(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    await CompanyService.deleteCompany(req.params.id);
    return ApiResponse.success(res, {
      message: 'Company deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Sub-endpoint relations
export const getCompanyLeads = async (req, res, next) => {
  try {
    const company = await CompanyService.getCompanyById(req.params.id);
    const leads = await Lead.find({ company: company.companyName, isDeleted: { $ne: true } });
    return ApiResponse.success(res, { data: leads });
  } catch (error) {
    next(error);
  }
};

export const getCompanyContacts = async (req, res, next) => {
  try {
    const company = await CompanyService.getCompanyById(req.params.id);
    const contacts = await Contact.find({ company: company.companyName, isDeleted: { $ne: true } });
    return ApiResponse.success(res, { data: contacts });
  } catch (error) {
    next(error);
  }
};

export const getCompanyDeals = async (req, res, next) => {
  try {
    const deals = await Deal.find({ companyId: req.params.id, isDeleted: { $ne: true } });
    return ApiResponse.success(res, { data: deals });
  } catch (error) {
    next(error);
  }
};

export const getCompanyMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ isDeleted: { $ne: true } }).limit(20);
    return ApiResponse.success(res, { data: meetings });
  } catch (error) {
    next(error);
  }
};

export const getCompanyCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ isDeleted: { $ne: true } }).limit(20);
    return ApiResponse.success(res, { data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const getCompanyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ entityType: 'Company', entityId: req.params.id, isDeleted: { $ne: true } });
    return ApiResponse.success(res, { data: documents });
  } catch (error) {
    next(error);
  }
};

export const getCompanyActivityTimeline = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find({ entityId: req.params.id }).sort('-createdAt');
    return ApiResponse.success(res, { data: activities });
  } catch (error) {
    next(error);
  }
};
