const multer = require('multer');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Le fichier dépasse la taille maximale autorisée (10 Mo)'
      : err.message;
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    message = err.errors?.[0]?.message || 'Données invalides';
  }

  if (!(err instanceof AppError) && status === 500 && process.env.NODE_ENV !== 'development') {
    message = 'Erreur interne du serveur';
  }

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
