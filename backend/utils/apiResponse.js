/**
 * Standardized API Response Helper
 */
export class ApiResponse {
  static success(res, { statusCode = 200, message = 'Operation successful', data = null, pagination = null }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data !== null ? data : {},
      pagination: pagination || {},
      errors: []
    });
  }

  static error(res, { statusCode = 500, message = 'An error occurred', errors = [] }) {
    const errorList = Array.isArray(errors) ? errors : [errors];
    return res.status(statusCode).json({
      success: false,
      message,
      data: {},
      pagination: {},
      errors: errorList
    });
  }
}
