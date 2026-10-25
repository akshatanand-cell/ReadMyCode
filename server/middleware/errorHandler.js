const logger = require("../utils/logger");

function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: "error",
      code: "LIMIT_FILE_SIZE",
      message: "ZIP file exceeds the 4MB serverless upload limit. For larger projects, please analyze directly via GitHub URL.",
    });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);
  res.status(statusCode).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
