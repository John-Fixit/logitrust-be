// src/middleware/errorHandler.js
const ApiResponse = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.badRequest(res, "Validation error", errors);
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return ApiResponse.badRequest(res, "Duplicate entry", err.errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Token expired");
  }

  // Default error
  return ApiResponse.error(
    res,
    err.message || "Internal server error",
    err.statusCode || 500,
  );
};

module.exports = errorHandler;
