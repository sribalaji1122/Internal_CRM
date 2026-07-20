// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.status) statusCode = err.status;

  let message = err.message || 'Internal Server Error';
  let errorDetails = {};

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = Object.values(err.errors).reduce((acc, curr) => {
      acc[curr.path] = curr.message;
      return acc;
    }, {});
  }

  // Mongoose duplicate key error (e.g. email exists)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Key Error';
    const field = Object.keys(err.keyValue)[0];
    errorDetails[field] = `${field} already exists`;
  }

  // Mongoose cast error (e.g. invalid MongoDB ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: Object.keys(errorDetails).length > 0 ? errorDetails : (process.env.NODE_ENV === 'development' ? err.stack : {})
  });
};

export default errorHandler;
