export class CalendarEventDTO {
  static transform(doc) {
    if (!doc) return null;
    const e = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: e._id || e.id,
      eventId: e.eventId || `EVT-${String(e._id || e.id).substring(18).toUpperCase()}`,
      title: e.title || '',
      entityType: e.entityType || e.type || 'Standalone',
      entityId: e.entityId || null,
      start: e.start,
      end: e.end || e.start,
      allDay: e.allDay || false,
      color: e.color || '#6366f1',
      status: e.status || 'Scheduled',
      location: e.location || '',
      description: e.description || '',
      notes: e.notes || '',
      recurrence: e.recurrence || 'None'
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
