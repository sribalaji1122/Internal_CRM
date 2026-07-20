export class MeetingDTO {
  static transform(doc) {
    if (!doc) return null;
    const m = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: m._id,
      meetingNumber: `MEET-${String(m._id).substring(18).toUpperCase()}`,
      title: m.title || '',
      description: m.description || '',
      relatedType: m.relatedType || 'Lead',
      relatedLeadId: m.relatedLeadId ? (m.relatedLeadId._id || m.relatedLeadId) : null,
      relatedContactId: m.relatedContactId ? (m.relatedContactId._id || m.relatedContactId) : null,
      meetingDate: m.meetingDate,
      startTime: m.startTime || '',
      endTime: m.endTime || '',
      meetingType: m.meetingType || 'Video Conference',
      status: m.status || 'Scheduled',
      location: m.location || '',
      meetingLink: m.meetingLink || '',
      agenda: m.agenda || '',
      notes: m.notes || '',
      createdBy: m.createdBy || 'Jane Doe',
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
