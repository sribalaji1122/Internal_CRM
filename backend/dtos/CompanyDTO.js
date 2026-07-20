export class CompanyDTO {
  static transform(doc) {
    if (!doc) return null;
    const c = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: c._id,
      companyCode: c.companyCode || `COMP-${String(c._id).substring(18).toUpperCase()}`,
      companyName: c.companyName || '',
      industry: c.industry || 'Technology',
      website: c.website || '',
      phone: c.phone || '',
      email: c.email || '',
      employeeCount: c.employeeCount || 0,
      annualRevenue: c.annualRevenue || 0,
      accountOwner: c.accountOwner || 'Jane Doe',
      status: c.status || 'Active',
      tier: c.tier || 'Standard',
      billingAddress: c.billingAddress || {},
      shippingAddress: c.shippingAddress || {},
      openDealsCount: c.openDeals || c.openDealsCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
