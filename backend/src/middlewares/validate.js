function formatZodErrors(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = req.validated || {};

      if (schemas.body) {
        req.validated.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.validated.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.validated.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        error.statusCode = 400;
        error.isOperational = true;
        error.message = 'Validation failed';
        error.errors = formatZodErrors(error);
      }
      next(error);
    }
  };
}

module.exports = { validate };
