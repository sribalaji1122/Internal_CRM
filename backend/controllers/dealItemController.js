import { DealItemService } from '../services/DealItemService.js';
import DealItem from '../models/DealItem.js';
import Deal from '../models/Deal.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getItemsByDealId = async (req, res, next) => {
  try {
    const items = await DealItemService.getItemsByDealId(req.params.dealId);
    return ApiResponse.success(res, { data: items });
  } catch (err) {
    next(err);
  }
};

export const createDealItem = async (req, res, next) => {
  try {
    const item = await DealItemService.createDealItem(req.body);
    // Recalculate Deal Amount
    const allItems = await DealItem.find({ dealId: item.dealId, isDeleted: { $ne: true } });
    const grandTotal = allItems.reduce((sum, i) => sum + (i.lineTotal || 0), 0);
    await Deal.findByIdAndUpdate(item.dealId, { amount: grandTotal });

    return ApiResponse.success(res, { statusCode: 201, message: 'Deal Item added', data: item });
  } catch (err) {
    next(err);
  }
};

export const updateDealItem = async (req, res, next) => {
  try {
    const item = await DealItemService.updateDealItem(req.params.id, req.body);
    const allItems = await DealItem.find({ dealId: item.dealId, isDeleted: { $ne: true } });
    const grandTotal = allItems.reduce((sum, i) => sum + (i.lineTotal || 0), 0);
    await Deal.findByIdAndUpdate(item.dealId, { amount: grandTotal });

    return ApiResponse.success(res, { message: 'Deal Item updated', data: item });
  } catch (err) {
    next(err);
  }
};

export const deleteDealItem = async (req, res, next) => {
  try {
    const item = await DealItem.findById(req.params.id);
    if (item) {
      await DealItemService.deleteDealItem(req.params.id);
      const allItems = await DealItem.find({ dealId: item.dealId, isDeleted: { $ne: true } });
      const grandTotal = allItems.reduce((sum, i) => sum + (i.lineTotal || 0), 0);
      await Deal.findByIdAndUpdate(item.dealId, { amount: grandTotal });
    }
    return ApiResponse.success(res, { message: 'Deal Item removed' });
  } catch (err) {
    next(err);
  }
};
