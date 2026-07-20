import Notification from '../models/Notification.js';

// @desc    Get all notifications (latest first)
// @route   GET /api/notifications
// @access  Public
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({}).sort('-createdAt').limit(50);
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get count of unread notifications
// @route   GET /api/notifications/unread-count
// @access  Public
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Public
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Public
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create system notifications on events (called from other controllers)
export const createSystemNotification = async (title, description, type = 'info') => {
  try {
    await Notification.create({ title, description, type });
  } catch (err) {
    console.error('Failed to write system notification log', err);
  }
};
