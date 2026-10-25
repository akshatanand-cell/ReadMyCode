const app = require("../server/app");
const connectDB = require("../server/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error in serverless:", err.message);
    // Let health check and root landing page answer even if DB is unavailable
    const url = req.url || "";
    if (url === "/" || url.startsWith("/api/health")) {
      return app(req, res);
    }
    return res.status(503).json({
      status: "error",
      code: "DB_UNAVAILABLE",
      message: "Database connection temporarily unavailable. Please retry shortly.",
    });
  }
  return app(req, res);
};
