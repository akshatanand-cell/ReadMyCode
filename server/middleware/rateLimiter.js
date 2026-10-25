const rateLimitMap = new Map();

/**
 * Lightweight sliding-window rate limiter for serverless and Express runtimes.
 * Prevents credit drainage on AI endpoints.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 min)
 * @param {number} options.max - Maximum requests per window per IP (default: 20)
 * @param {string} options.message - Error message when rate limit exceeded
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 20;
  const message = options.message || "Too many analysis requests. Please wait a few minutes before trying again.";

  return (req, res, next) => {
    // When trust proxy is enabled, req.ip resolves to the true client IP
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count += 1;
    }

    rateLimitMap.set(ip, clientData);

    // Periodically prune stale entries
    if (rateLimitMap.size > 5000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetTime) rateLimitMap.delete(k);
      }
    }

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - clientData.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(clientData.resetTime / 1000));

    if (clientData.count > max) {
      return res.status(429).json({
        status: "error",
        code: "RATE_LIMIT_EXCEEDED",
        message,
        retryAfterSeconds: Math.ceil((clientData.resetTime - now) / 1000),
      });
    }

    next();
  };
}

const analysisLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Repository analysis quota reached. Please wait a few minutes or provide your GitHub Personal Access Token.",
});

const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "AI document generation quota reached. Please wait a few minutes before generating more documentation.",
});

module.exports = { createRateLimiter, analysisLimiter, aiLimiter };
