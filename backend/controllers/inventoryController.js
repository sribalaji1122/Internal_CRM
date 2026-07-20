import { InventoryTransactionService } from '../services/InventoryTransactionService.js';
import { InventoryReservationService } from '../services/InventoryReservationService.js';
import Product from '../models/Product.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, transactionType, quantity, reason } = req.body;
    if (!productId || !transactionType || quantity === undefined) {
      return ApiResponse.error(res, { statusCode: 400, message: 'productId, transactionType, and quantity are required' });
    }
    const log = await InventoryTransactionService.recordTransaction({
      productId,
      transactionType,
      quantity,
      reason,
      createdBy: req.body.createdBy || 'Jane Doe'
    });

    return ApiResponse.success(res, { message: 'Inventory adjusted successfully', data: log });
  } catch (err) {
    next(err);
  }
};

export const reserveStock = async (req, res, next) => {
  try {
    const { productId, quantity, dealId, reason } = req.body;
    const result = await InventoryReservationService.reserveStock({
      productId,
      quantity,
      dealId,
      reason
    });
    return ApiResponse.success(res, { message: 'Stock reserved successfully', data: result });
  } catch (err) {
    next(err);
  }
};

export const releaseStock = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;
    const result = await InventoryReservationService.releaseReservation({
      productId,
      quantity,
      reason
    });
    return ApiResponse.success(res, { message: 'Reservation released', data: result });
  } catch (err) {
    next(err);
  }
};

export const getInventorySummary = async (req, res, next) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } });
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stockQuantity || 0) * (p.unitPrice || 0)), 0);
    const lowStockCount = products.filter(p => p.stockStatus === 'Low Stock').length;
    const outOfStockCount = products.filter(p => p.stockStatus === 'Out of Stock').length;
    const totalReservedStock = products.reduce((sum, p) => sum + (p.reservedQuantity || 0), 0);

    return ApiResponse.success(res, {
      data: {
        totalInventoryValue,
        lowStockCount,
        outOfStockCount,
        totalReservedStock,
        totalProductsCount: products.length,
        incomingStockPlaceholder: 150,
        topMovingProducts: [
          { name: '3HP AC Motor', unitsMoved: 84 },
          { name: 'Industrial Water Pump', unitsMoved: 52 }
        ],
        slowMovingProducts: [
          { name: 'Custom Control Panel', unitsMoved: 2 }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};
