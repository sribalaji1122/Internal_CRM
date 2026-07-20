import Product from '../models/Product.js';
import Quote from '../models/Quote.js';
import Deal from '../models/Deal.js';

class ReportingEngineServiceClass {
  async generateReport(reportType = 'Sales', format = 'JSON') {
    let data = [];

    if (reportType === 'Product') {
      data = await Product.find({ isDeleted: { $ne: true } }).lean();
    } else if (reportType === 'Quote') {
      data = await Quote.find({ isDeleted: { $ne: true } }).lean();
    } else if (reportType === 'Inventory') {
      data = await Product.find({ isDeleted: { $ne: true } }).select('productCode name stockQuantity reservedQuantity availableQuantity stockStatus unitPrice').lean();
    } else {
      data = await Deal.find({ isDeleted: { $ne: true } }).lean();
    }

    if (format === 'CSV') {
      return this.convertToCsv(data);
    }

    return {
      reportType,
      generatedAt: new Date(),
      totalRecords: data.length,
      data
    };
  }

  convertToCsv(items) {
    if (!items || items.length === 0) return '';
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(item => Object.values(item).map(val => `"${val}"`).join(','));
    return [headers, ...rows].join('\n');
  }
}

export const ReportingEngineService = new ReportingEngineServiceClass();
