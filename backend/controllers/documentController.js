import Document from '../models/Document.js';
import { logActivity } from './activityController.js';

// @desc    Get documents associated with an entity
// @route   GET /api/documents/:entityType/:entityId
// @access  Public
export const getDocumentsByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const documents = await Document.find({ entityType, entityId }).sort('-createdAt');
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate/create document metadata upload
// @route   POST /api/documents
// @access  Public
export const uploadDocument = async (req, res, next) => {
  try {
    const { entityType, entityId, fileName, fileSize, fileUrl } = req.body;

    if (!entityType || !entityId || !fileName || !fileSize) {
      return res.status(400).json({ success: false, message: 'Please provide entityType, entityId, fileName, and fileSize' });
    }

    const docUrl = fileUrl || `/uploads/${Date.now()}_${fileName}`;
    const document = await Document.create({
      entityType,
      entityId,
      fileName,
      fileSize,
      fileUrl: docUrl,
      uploadedBy: req.body.uploadedBy || 'Jane Doe'
    });

    // Log this activity
    await logActivity(
      'Document Uploaded',
      entityType,
      entityId,
      `Uploaded document "${fileName}" (${(fileSize / 1024).toFixed(1)} KB)`
    );

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document metadata
// @route   DELETE /api/documents/:id
// @access  Public
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity(
      'Company Updated', // fallback standard type
      document.entityType,
      document.entityId,
      `Removed document "${document.fileName}"`
    );

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
