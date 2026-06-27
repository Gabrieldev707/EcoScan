function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}

function normalizeErrors(errors) {
  if (!Array.isArray(errors)) return [];

  return errors.map((error) => ({
    path: error.path || '',
    message: error.message || 'Invalid value',
  }));
}

function errorHandler(error, _req, res, _next) {
  let statusCode = Number(error.statusCode || error.status || 500);
  const isProduction = process.env.NODE_ENV === 'production';
  const isOperational = error.isOperational || statusCode < 500;

  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    message = 'Validation failed';
    statusCode = 400;
  }

  if (error.code === 11000) {
    message = 'Resource already exists';
    statusCode = 409;
  }

  if (isProduction && !isOperational) {
    message = 'Internal server error';
  }

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    message,
    errors: normalizeErrors(error.errors),
  });
}

module.exports = { errorHandler, notFoundHandler };
