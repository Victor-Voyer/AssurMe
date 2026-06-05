class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(msg = 'Ressource introuvable') {
    super(msg, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(msg = 'Non autorisé') {
    super(msg, 401);
  }
}

class ValidationError extends AppError {
  constructor(msg) {
    super(msg, 400);
  }
}

module.exports = { AppError, NotFoundError, UnauthorizedError, ValidationError };
