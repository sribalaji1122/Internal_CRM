import SavedFilter from '../models/SavedFilter.js';

// @desc    Get all saved filters (optionally filtered by CRM module e.g. ?module=leads)
// @route   GET /api/saved-filters
// @access  Public
export const getSavedFilters = async (req, res, next) => {
  try {
    const { module } = req.query;
    const query = {};
    if (module) {
      query.module = module;
    }

    const filters = await SavedFilter.find(query).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: filters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new saved filter combination
// @route   POST /api/saved-filters
// @access  Public
export const createSavedFilter = async (req, res, next) => {
  try {
    const { name, module, filters } = req.body;
    
    // Check if name is already saved for this module to avoid redundancy
    const existing = await SavedFilter.findOne({ name, module });
    if (existing) {
      existing.filters = filters;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Saved filter updated successfully',
        data: existing
      });
    }

    const savedFilter = await SavedFilter.create({ name, module, filters });
    res.status(201).json({
      success: true,
      message: 'Filter saved successfully',
      data: savedFilter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved filter
// @route   DELETE /api/saved-filters/:id
// @access  Public
export const deleteSavedFilter = async (req, res, next) => {
  try {
    const savedFilter = await SavedFilter.findByIdAndDelete(req.params.id);

    if (!savedFilter) {
      return res.status(404).json({
        success: false,
        message: 'Saved filter not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Saved filter deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
