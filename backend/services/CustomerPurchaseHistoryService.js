import Deal from '../models/Deal.js';
import Quote from '../models/Quote.js';
import DealItem from '../models/DealItem.js';
import ActivityLog from '../models/ActivityLog.js';

class CustomerPurchaseHistoryServiceClass {
  async getPurchaseHistoryForCompany(companyId) {
    const [deals, quotes] = await Promise.all([
      Deal.find({ companyId, isDeleted: { $ne: true } }),
      Quote.find({ companyId, isDeleted: { $ne: true } })
    ]);

    const dealIds = deals.map(d => d._id);
    const dealItems = await DealItem.find({ dealId: { $in: dealIds }, isDeleted: { $ne: true } }).populate('productId', 'name productCode unitPrice SKU');

    const totalRevenue = deals.filter(d => d.status === 'Won').reduce((sum, d) => sum + (d.amount || 0), 0);

    const activities = await ActivityLog.find({ entityId: companyId }).sort('-createdAt').limit(20);

    return {
      companyId,
      totalDeals: deals.length,
      wonDealsCount: deals.filter(d => d.status === 'Won').length,
      totalQuotesCount: quotes.length,
      totalRevenue,
      purchasedProducts: dealItems.map(item => ({
        dealId: item.dealId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        purchasedAt: item.createdAt
      })),
      recentActivity: activities
    };
  }
}

export const CustomerPurchaseHistoryService = new CustomerPurchaseHistoryServiceClass();
