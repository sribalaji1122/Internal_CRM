export class DealDTO {
  static transform(doc) {
    if (!doc) return null;
    const d = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: d._id,
      dealNumber: d.dealNumber || `DEAL-${String(d._id).substring(18).toUpperCase()}`,
      dealName: d.dealName || '',
      companyId: d.companyId ? (d.companyId._id || d.companyId) : null,
      companyName: d.companyId?.companyName || d.companyName || 'Unknown',
      primaryContactId: d.primaryContactId ? (d.primaryContactId._id || d.primaryContactId) : null,
      leadId: d.leadId ? (d.leadId._id || d.leadId) : null,
      pipeline: d.pipeline || 'Default Pipeline',
      stage: d.stage || 'Prospecting',
      status: d.status || 'Open',
      amount: d.amount || 0,
      expectedRevenue: d.expectedRevenue || 0,
      probability: d.probability || 10,
      expectedCloseDate: d.expectedCloseDate,
      actualCloseDate: d.actualCloseDate,
      owner: d.owner || 'Jane Doe',
      stageHistory: d.stageHistory || [],
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
