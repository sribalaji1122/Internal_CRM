import Lead from '../models/Lead.js';
import Contact from '../models/Contact.js';
import Meeting from '../models/Meeting.js';
import Campaign from '../models/Campaign.js';
import Company from '../models/Company.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import ProductBrand from '../models/ProductBrand.js';
import ProductVariant from '../models/ProductVariant.js';
import Quote from '../models/Quote.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return ApiResponse.success(res, {
        message: 'Empty query',
        data: { leads: [], contacts: [], meetings: [], campaigns: [], companies: [], deals: [], tasks: [], products: [], quotes: [], categories: [], brands: [] }
      });
    }

    const searchRegex = new RegExp(q, 'i');

    const [leads, contacts, meetings, campaigns, rawCompanies, rawDeals, tasks, products, quotes, categories, brands] = await Promise.all([
      Lead.find({
        isDeleted: { $ne: true },
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { company: searchRegex }, { email: searchRegex }, { phone: searchRegex }]
      }).limit(5),

      Contact.find({
        isDeleted: { $ne: true },
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { company: searchRegex }, { email: searchRegex }, { phone: searchRegex }]
      }).limit(5),

      Meeting.find({
        isDeleted: { $ne: true },
        $or: [{ title: searchRegex }, { location: searchRegex }, { meetingType: searchRegex }]
      }).limit(5),

      Campaign.find({
        isDeleted: { $ne: true },
        $or: [{ name: searchRegex }, { owner: searchRegex }, { campaignType: searchRegex }]
      }).limit(5),

      Company.find({
        isDeleted: { $ne: true },
        $or: [{ companyName: searchRegex }, { companyCode: searchRegex }, { industry: searchRegex }, { email: searchRegex }, { accountOwner: searchRegex }]
      }).limit(5),

      Deal.find({
        isDeleted: { $ne: true },
        $or: [{ dealName: searchRegex }, { dealNumber: searchRegex }, { owner: searchRegex }, { source: searchRegex }]
      }).populate('companyId', 'companyName').limit(5),

      Task.find({
        isDeleted: { $ne: true },
        $or: [{ title: searchRegex }, { taskNumber: searchRegex }, { assignedTo: searchRegex }, { description: searchRegex }]
      })
        .populate('companyId', 'companyName')
        .populate('dealId', 'dealName')
        .limit(5),

      Product.find({
        isDeleted: { $ne: true },
        $or: [{ name: searchRegex }, { productCode: searchRegex }, { sku: searchRegex }, { barcode: searchRegex }, { tags: searchRegex }]
      }).limit(5),

      Quote.find({
        isDeleted: { $ne: true },
        $or: [{ quoteNumber: searchRegex }, { subject: searchRegex }, { status: searchRegex }]
      }).limit(5),

      ProductCategory.find({
        isDeleted: { $ne: true },
        $or: [{ name: searchRegex }, { code: searchRegex }]
      }).limit(5),

      ProductBrand.find({
        isDeleted: { $ne: true },
        $or: [{ name: searchRegex }, { code: searchRegex }]
      }).limit(5)
    ]);

    const companies = await Promise.all(rawCompanies.map(async (c) => {
      const openDealsCount = await Deal.countDocuments({ companyId: c._id, status: { $in: ['Open', 'In Progress'] } });
      return {
        ...c.toObject(),
        openDeals: openDealsCount
      };
    }));

    const deals = rawDeals.map(d => ({
      ...d.toObject(),
      companyName: d.companyId?.companyName || 'Unknown'
    }));

    return ApiResponse.success(res, {
      message: 'Search query processed successfully',
      data: { leads, contacts, meetings, campaigns, companies, deals, tasks, products, quotes, categories, brands }
    });
  } catch (error) {
    next(error);
  }
};
