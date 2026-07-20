import { ProductService } from '../services/ProductService.js';
import { ProductPriceHistoryService } from '../services/ProductPriceHistoryService.js';
import { InventoryTransactionService } from '../services/InventoryTransactionService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, brand, stockStatus, page, limit, sort } = req.query;
    const result = await ProductService.getAllProducts({
      search,
      category,
      brand,
      stockStatus,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Products fetched successfully',
      data: result.products,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    return ApiResponse.success(res, { message: 'Product fetched', data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Product created successfully', data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    return ApiResponse.success(res, { message: 'Product updated successfully', data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    return ApiResponse.success(res, { message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs array is required' });
    }
    const result = await ProductService.bulkDelete(ids);
    return ApiResponse.success(res, { message: `${result.count} Products deleted` });
  } catch (err) {
    next(err);
  }
};

export const bulkUpdateProducts = async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs array is required' });
    }
    const result = await ProductService.bulkUpdate(ids, updates);
    return ApiResponse.success(res, { message: `${result.count} Products updated` });
  } catch (err) {
    next(err);
  }
};

export const importProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Products array is required' });
    }
    const created = [];
    for (const pData of products) {
      const p = await ProductService.createProduct(pData);
      created.push(p);
    }
    return ApiResponse.success(res, { message: `${created.length} Products imported` });
  } catch (err) {
    next(err);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const stats = await ProductService.getProductStats(req.params.id);
    return ApiResponse.success(res, { data: stats });
  } catch (err) {
    next(err);
  }
};

export const getProductPriceHistory = async (req, res, next) => {
  try {
    const history = await ProductPriceHistoryService.getHistoryByProductId(req.params.id);
    return ApiResponse.success(res, { data: history });
  } catch (err) {
    next(err);
  }
};

export const getProductTransactions = async (req, res, next) => {
  try {
    const logs = await InventoryTransactionService.getTransactionsByProductId(req.params.id);
    return ApiResponse.success(res, { data: logs });
  } catch (err) {
    next(err);
  }
};
