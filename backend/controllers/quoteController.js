import { QuoteService } from '../services/QuoteService.js';
import { PdfGenerator } from '../utils/pdfGenerator.js';
import { ApiResponse } from '../utils/apiResponse.js';
import Quote from '../models/Quote.js';

export const getAllQuotes = async (req, res, next) => {
  try {
    const { search, status, page, limit, sort } = req.query;
    const result = await QuoteService.getAllQuotes({
      search,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort
    });

    return ApiResponse.success(res, {
      message: 'Quotes fetched successfully',
      data: result.quotes,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const getQuoteById = async (req, res, next) => {
  try {
    const quote = await QuoteService.getQuoteById(req.params.id);
    return ApiResponse.success(res, { message: 'Quote fetched', data: quote });
  } catch (err) {
    next(err);
  }
};

export const createQuote = async (req, res, next) => {
  try {
    const quote = await QuoteService.createQuote(req.body);
    return ApiResponse.success(res, { statusCode: 201, message: 'Quote created successfully', data: quote });
  } catch (err) {
    next(err);
  }
};

export const updateQuoteStatus = async (req, res, next) => {
  try {
    const { status, comments, approvedBy, approvalLevel } = req.body;
    const updated = await QuoteService.updateQuoteStatus(req.params.id, status, comments, approvedBy, approvalLevel);
    return ApiResponse.success(res, { message: `Quote status updated to ${status}`, data: updated });
  } catch (err) {
    next(err);
  }
};

export const cloneQuote = async (req, res, next) => {
  try {
    const cloned = await QuoteService.cloneQuote(req.params.id);
    return ApiResponse.success(res, { statusCode: 201, message: 'Quote cloned successfully', data: cloned });
  } catch (err) {
    next(err);
  }
};

export const archiveQuote = async (req, res, next) => {
  try {
    const archived = await QuoteService.archiveQuote(req.params.id);
    return ApiResponse.success(res, { message: 'Quote archived', data: archived });
  } catch (err) {
    next(err);
  }
};

export const emailQuote = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await QuoteService.emailQuote(req.params.id, email || 'client@example.com');
    return ApiResponse.success(res, { message: result.message });
  } catch (err) {
    next(err);
  }
};

export const convertToSalesOrder = async (req, res, next) => {
  try {
    const result = await QuoteService.convertToSalesOrder(req.params.id);
    return ApiResponse.success(res, { message: result.message, data: result.orderData });
  } catch (err) {
    next(err);
  }
};

export const getQuotePdfHtml = async (req, res, next) => {
  try {
    const quote = await QuoteService.getQuoteById(req.params.id);
    const html = PdfGenerator.generateQuoteHtml(quote, []);
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

export const bulkApproveQuotes = async (req, res, next) => {
  try {
    const { ids, approvedBy } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'IDs array is required' });
    }
    for (const id of ids) {
      await QuoteService.updateQuoteStatus(id, 'Approved', 'Bulk Manager Approval', approvedBy || 'Jane Doe');
    }
    return ApiResponse.success(res, { message: `${ids.length} Quotes approved` });
  } catch (err) {
    next(err);
  }
};

export const checkQuoteExpiries = async (req, res, next) => {
  try {
    const expiredCount = await Quote.updateMany(
      { validUntil: { $lt: new Date() }, status: { $nin: ['Accepted', 'Rejected', 'Expired'] }, isDeleted: { $ne: true } },
      { status: 'Expired' }
    );
    return ApiResponse.success(res, { message: `Automated expiry check complete. ${expiredCount.modifiedCount} quotes marked Expired.` });
  } catch (err) {
    next(err);
  }
};
