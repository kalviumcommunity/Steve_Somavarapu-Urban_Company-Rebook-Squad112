function notFoundHandler(req, res, next) {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, req, res, next) {
  console.error("[Server Error]", err);

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: isProduction ? "An unexpected error occurred." : err.message || "An unexpected error occurred.",
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
