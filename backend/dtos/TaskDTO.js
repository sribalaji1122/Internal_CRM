export class TaskDTO {
  static transform(doc) {
    if (!doc) return null;
    const t = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return {
      id: t._id,
      taskNumber: t.taskNumber || `TASK-${String(t._id).substring(18).toUpperCase()}`,
      title: t.title || '',
      description: t.description || '',
      taskType: t.taskType || 'To-Do',
      priority: t.priority || 'Medium',
      status: t.status || 'Not Started',
      dueDate: t.dueDate,
      startDate: t.startDate,
      assignedTo: t.assignedTo || 'Jane Doe',
      createdBy: t.createdBy || 'Jane Doe',
      companyId: t.companyId ? (t.companyId._id || t.companyId) : null,
      contactId: t.contactId ? (t.contactId._id || t.contactId) : null,
      leadId: t.leadId ? (t.leadId._id || t.leadId) : null,
      dealId: t.dealId ? (t.dealId._id || t.dealId) : null,
      meetingId: t.meetingId ? (t.meetingId._id || t.meetingId) : null,
      campaignId: t.campaignId ? (t.campaignId._id || t.campaignId) : null,
      parentTaskId: t.parentTaskId || null,
      dependsOn: t.dependsOn || [],
      progressPercentage: t.progressPercentage || 0,
      notes: t.notes || '',
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
  }

  static transformMany(docs) {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => this.transform(d));
  }
}
