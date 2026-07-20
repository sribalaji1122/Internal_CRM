export class ContactDTO {
  static transform(doc) {
    if (!doc) return null;
    const c = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: c._id,
      contactNumber: c.contactNumber || `CONT-${String(c._id).substring(18).toUpperCase()}`,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      jobTitle: c.jobTitle || '',
      contactSource: c.contactSource || 'Direct',
      owner: c.owner || 'Jane Doe',
      originalLeadId: c.originalLeadId || null,
      notes: c.notes || '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
