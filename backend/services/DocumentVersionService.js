import DocumentVersion from '../models/DocumentVersion.js';

class DocumentVersionServiceClass {
  async createVersion({ documentId, fileUrl, uploadedBy = 'Jane Doe', reason = 'New Revision' }) {
    // Unmark previous latest
    await DocumentVersion.updateMany({ documentId }, { isLatest: false });

    const previousVersions = await DocumentVersion.find({ documentId });
    const revisionNumber = previousVersions.length + 1;

    const version = await DocumentVersion.create({
      documentId,
      revisionNumber,
      fileUrl,
      uploadedBy,
      reason,
      isLatest: true,
      uploadedAt: new Date()
    });

    return version;
  }

  async getVersionsByDocumentId(documentId) {
    return await DocumentVersion.find({ documentId }).sort('-revisionNumber');
  }
}

export const DocumentVersionService = new DocumentVersionServiceClass();
