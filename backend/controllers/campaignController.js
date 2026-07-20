import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import { createSystemNotification } from './notificationController.js';

// @desc    Get all campaigns (with pagination, filtering, search and sort)
// @route   GET /api/campaigns
// @access  Public
export const getAllCampaigns = async (req, res, next) => {
  try {
    const { search, status, campaignType, date, page, limit, sort, contactId } = req.query;

    const query = {};

    // Filter by associated contact if contactId query parameter is provided
    if (contactId) {
      query.associatedContacts = contactId;
    }

    // Search query parser (searches name, description, owner)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { owner: searchRegex }
      ];
    }

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Campaign Type filter
    if (campaignType && campaignType !== 'ALL') {
      query.campaignType = campaignType;
    }

    // Date filter (campaigns active during/around this date)
    if (date) {
      const checkDate = new Date(date);
      query.startDate = { $lte: checkDate };
      query.endDate = { $gte: checkDate };
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortStr = '-createdAt';
    if (sort) {
      if (sort === 'name') {
        sortStr = 'name';
      } else if (sort === 'budget') {
        sortStr = 'budget';
      } else if (sort === 'date') {
        sortStr = 'startDate';
      } else if (sort === '-date') {
        sortStr = '-startDate';
      } else {
        sortStr = sort;
      }
    }

    const totalCampaigns = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort(sortStr)
      .skip(skip)
      .limit(limitNum)
      .populate('associatedContacts', 'firstName lastName company email phone');

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        totalRecords: totalCampaigns,
        totalPages: Math.ceil(totalCampaigns / limitNum),
        currentPage: pageNum,
        recordsPerPage: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('associatedContacts', 'firstName lastName company email phone jobTitle');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Public
export const createCampaign = async (req, res, next) => {
  try {
    // Basic date check before database validation
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be earlier than start date'
        });
      }
    }

    const campaign = await Campaign.create(req.body);

    await createSystemNotification(
      'Campaign Created',
      `Marketing campaign "${campaign.name}" has been launched (${campaign.campaignType}).`,
      'info'
    );

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Public
export const updateCampaign = async (req, res, next) => {
  try {
    // Basic date check on updates
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be earlier than start date'
        });
      }
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Public
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: `Campaign not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
