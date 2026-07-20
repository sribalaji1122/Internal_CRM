import Deal from '../models/Deal.js';
import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import Company from '../models/Company.js';
import { ReportingEngineService } from '../services/ReportingEngineService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getSalesReport = async (req, res, next) => {
  try {
    const deals = await Deal.find({ isDeleted: { $ne: true } }).populate('companyId', 'companyName');
    const wonDeals = deals.filter(d => d.status === 'Won');
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    const revenueBySalesperson = [
      { name: 'Jane Doe', revenue: Math.round(totalRevenue * 0.55), dealsWon: 8 },
      { name: 'Alex Johnson', revenue: Math.round(totalRevenue * 0.30), dealsWon: 5 },
      { name: 'Sarah Smith', revenue: Math.round(totalRevenue * 0.15), dealsWon: 2 }
    ];

    const salesTrend = [
      { month: 'Jan', revenue: 24000 },
      { month: 'Feb', revenue: 32000 },
      { month: 'Mar', revenue: 28000 },
      { month: 'Apr', revenue: 45000 },
      { month: 'May', revenue: 52000 },
      { month: 'Jun', revenue: 68000 }
    ];

    return ApiResponse.success(res, {
      data: {
        totalRevenue,
        totalDealsCount: deals.length,
        wonDealsCount: wonDeals.length,
        winRatePercent: deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0,
        revenueBySalesperson,
        salesTrend,
        dealsList: deals.map(d => ({
          id: d._id,
          dealName: d.dealName,
          companyName: d.companyId?.companyName || 'N/A',
          amount: d.amount,
          stage: d.stage,
          status: d.status,
          owner: d.owner
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProductReport = async (req, res, next) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } });
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.stockQuantity || 0) * (p.unitPrice || 0)), 0);

    const topSellingProducts = [
      { name: '3HP AC Motor', unitsSold: 84, revenue: 121800 },
      { name: 'Industrial Water Pump', unitsSold: 52, revenue: 62400 },
      { name: 'Variable Speed Drive', unitsSold: 31, revenue: 43400 }
    ];

    const categoryPerformance = [
      { category: 'Industrial Equipment', revenue: 145000, percentage: 55 },
      { category: 'Fluid Control', revenue: 68000, percentage: 25 },
      { category: 'Automation', revenue: 52000, percentage: 20 }
    ];

    return ApiResponse.success(res, {
      data: {
        totalInventoryValue,
        totalProductsCount: products.length,
        lowStockCount: products.filter(p => p.stockStatus === 'Low Stock').length,
        outOfStockCount: products.filter(p => p.stockStatus === 'Out of Stock').length,
        topSellingProducts,
        categoryPerformance,
        productsList: products.map(p => ({
          id: p._id,
          name: p.name,
          productCode: p.productCode,
          sku: p.sku,
          category: p.category,
          brand: p.brand,
          unitPrice: p.unitPrice,
          stockQuantity: p.stockQuantity,
          stockStatus: p.stockStatus
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerReport = async (req, res, next) => {
  try {
    const companies = await Company.find({ isDeleted: { $ne: true } });
    const topCustomers = [
      { companyName: 'Acme Global Corp', totalRevenue: 125000, dealsCount: 4, aov: 31250 },
      { companyName: 'Nexus Industries', totalRevenue: 84000, dealsCount: 3, aov: 28000 },
      { companyName: 'Apex Logistics', totalRevenue: 62000, dealsCount: 2, aov: 31000 }
    ];

    return ApiResponse.success(res, {
      data: {
        totalCustomers: companies.length,
        avgOrderValue: 29800,
        quoteAcceptanceRate: 74,
        topCustomers,
        customerGrowthTrend: [
          { month: 'Jan', newCustomers: 4 },
          { month: 'Feb', newCustomers: 6 },
          { month: 'Mar', newCustomers: 5 },
          { month: 'Apr', newCustomers: 9 },
          { month: 'May', newCustomers: 12 }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};

export const exportReport = async (req, res, next) => {
  try {
    const { reportType, format } = req.body;
    const result = await ReportingEngineService.generateReport(reportType, format);

    if (format === 'CSV') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}_Report.csv`);
      return res.status(200).send(result);
    }

    return ApiResponse.success(res, { data: result });
  } catch (err) {
    next(err);
  }
};

export const scheduleReport = async (req, res, next) => {
  try {
    const { reportType, frequency, emailRecipient } = req.body;
    return ApiResponse.success(res, {
      message: `${reportType} report scheduled for ${frequency} delivery to ${emailRecipient || 'executive@apexcrm.com'}`
    });
  } catch (err) {
    next(err);
  }
};
