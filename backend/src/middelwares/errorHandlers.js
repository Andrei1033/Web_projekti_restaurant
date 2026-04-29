// errorHandlers.js //
import {validationResult} from 'express-validator';

// validation errors
const validationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(', ');

    const error = new Error(messages);
    error.status = 400;
    return next(error);
  }

  next();
};

// global error handler
const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.message);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

export {validationErrors, errorHandler};
