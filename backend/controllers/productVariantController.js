import { ProductVariantService } from '../services/ProductVariantService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getVariantsByProduct = async (req, res, next) => {
  try {
    const variants = await ProductVariantService.getVariantsByProductId(req.params.productId);
    return ApiResponse.success(res, { data: variants });
  } catch (err) {
    next(err);
  }
};

export const createVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariantService.createVariant(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Variant created', data: variant });
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const updated = await ProductVariantService.updateVariant(req.params.id, req.body);
    return ApiResponse.success(res, { message: 'Variant updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    await ProductVariantService.deleteVariant(req.params.id);
    return ApiResponse.success(res, { message: 'Variant deleted' });
  } catch (err) {
    next(err);
  }
};
