// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`
  });
};

export default notFound;
