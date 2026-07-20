import ActivityLog from '../models/ActivityLog.js';
import Lead from '../models/Lead.js';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import Company from '../models/Company.js';

// Helper function to log activities programmatically
export const logActivity = async (activityType, entityType, entityId, description, actor = 'Jane Doe', meta = {}) => {
  try {
    const activity = await ActivityLog.create({
      activityType,
      entityType,
      entityId,
      actor,
      description,
      meta
    });
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

// @desc    Get activities for a company and all its related entities (Leads, Contacts, Deals)
// @route   GET /api/activity/company/:id
// @access  Public
export const getCompanyActivity = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch related entity IDs
    const [leads, contacts, deals] = await Promise.all([
      Lead.find({ company: company.companyName }, '_id'),
      Contact.find({ company: company.companyName }, '_id'),
      Deal.find({ companyId: company._id }, '_id')
    ]);

    const leadIds = leads.map(l => l._id);
    const contactIds = contacts.map(c => c._id);
    const dealIds = deals.map(d => d._id);

    // Combine all relevant entity IDs
    const allRelevantIds = [company._id, ...leadIds, ...contactIds, ...dealIds];

    const totalRecords = await ActivityLog.countDocuments({ entityId: { $in: allRelevantIds } });
    const activities = await ActivityLog.find({ entityId: { $in: allRelevantIds } })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        recordsPerPage: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activities for a specific deal
// @route   GET /api/activity/deal/:id
// @access  Public
export const getDealActivity = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalRecords = await ActivityLog.countDocuments({ entityId: deal._id });
    const activities = await ActivityLog.find({ entityId: deal._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        recordsPerPage: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
