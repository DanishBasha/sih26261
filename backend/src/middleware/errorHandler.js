export function notFound(req, res, next) {
  res.status(404).json({ success: false, error: `Not Found - ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  console.error('API Error:', err);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
