export class LeadDTO {
  static transform(doc) {
    if (!doc) return null;
    const l = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: l._id,
      leadNumber: l.leadNumber || `LEAD-${String(l._id).substring(18).toUpperCase()}`,
      firstName: l.firstName || '',
      lastName: l.lastName || '',
      fullName: `${l.firstName || ''} ${l.lastName || ''}`.trim(),
      email: l.email || '',
      phone: l.phone || '',
      company: l.company || '',
      jobTitle: l.jobTitle || '',
      status: l.status || 'New',
      leadSource: l.leadSource || 'Website',
      rating: l.rating || 'Warm',
      owner: l.owner || 'Jane Doe',
      isConverted: l.isConverted || false,
      convertedContactId: l.convertedContactId || null,
      customAttributes: l.customAttributes || {},
      notes: l.notes || '',
      createdAt: l.createdAt,
      updatedAt: l.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
