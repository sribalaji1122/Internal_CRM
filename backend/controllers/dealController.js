import { DealService } from '../services/DealService.js';
import Deal from '../models/Deal.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllDeals = async (req, res, next) => {
  try {
    const { search, stage, status, pipeline, page, limit, sort } = req.query;
    const result = await DealService.getAllDeals({
      search,
      stage,
      status,
      pipeline,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Deals fetched successfully',
      data: result.deals,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req, res, next) => {
  try {
    const deal = await DealService.getDealById(req.params.id);
    return ApiResponse.success(res, {
      message: 'Deal fetched successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req, res, next) => {
  try {
    const deal = await DealService.createDeal(req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeal = async (req, res, next) => {
  try {
    const deal = await DealService.updateDeal(req.params.id, req.body);
    return ApiResponse.success(res, {
      message: 'Deal updated successfully',
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req, res, next) => {
  try {
    await DealService.deleteDeal(req.params.id);
    return ApiResponse.success(res, {
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateDealStage = async (req, res, next) => {
  try {
    const { stage } = req.body;
    if (!stage) return ApiResponse.error(res, { statusCode: 400, message: 'Stage is required' });

    const deal = await DealService.updateDeal(req.params.id, { stage });
    return ApiResponse.success(res, {
      message: `Deal stage updated to ${stage}`,
      data: deal
    });
  } catch (error) {
    next(error);
  }
};

export const getDealPipelineSummary = async (req, res, next) => {
  try {
    const summary = await Deal.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$amount' } } }
    ]);
    return ApiResponse.success(res, { data: summary });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteDeals = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs list is required' });
    }
    for (const id of ids) {
      await DealService.deleteDeal(id);
    }
    return ApiResponse.success(res, { message: `${ids.length} Deals deleted successfully` });
  } catch (error) {
    next(error);
  }
};
