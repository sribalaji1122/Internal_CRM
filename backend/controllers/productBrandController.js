import ProductBrand from '../models/ProductBrand.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllBrands = async (req, res, next) => {
  try {
    const brands = await ProductBrand.find({ isDeleted: { $ne: true } }).sort('name');
    return ApiResponse.success(res, { data: brands });
  } catch (err) {
    next(err);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const brand = await ProductBrand.create(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Brand created', data: brand });
  } catch (err) {
    next(err);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const updated = await ProductBrand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return ApiResponse.success(res, { message: 'Brand updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await ProductBrand.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return ApiResponse.success(res, { message: 'Brand deleted' });
  } catch (err) {
    next(err);
  }
};
