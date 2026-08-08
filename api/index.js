const app = require("../server/app");
const connectDB = require("../server/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("DB connection error in serverless:", err.message);
  }
  return app(req, res);
};
