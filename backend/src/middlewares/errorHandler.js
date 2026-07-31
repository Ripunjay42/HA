export const notFound = (req, res, next) => {
  res.status(404).json({ status: 'error', message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ status: 'error', message: err.message || 'Internal Server Error' });
};
