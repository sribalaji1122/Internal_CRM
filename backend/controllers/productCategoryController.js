import ProductCategory from '../models/ProductCategory.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await ProductCategory.find({ isDeleted: { $ne: true } }).sort('displayOrder name');
    return ApiResponse.success(res, { data: categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await ProductCategory.create(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Category created', data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const updated = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return ApiResponse.success(res, { message: 'Category updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await ProductCategory.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return ApiResponse.success(res, { message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
