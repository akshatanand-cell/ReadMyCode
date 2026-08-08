const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");

async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    logger.success(`ReadMyCode server running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${PORT} is already in use by another process!`);
      logger.warn(`Another instance of server is already running on http://localhost:${PORT}`);
      logger.warn(`To free port ${PORT}, run in terminal: npx kill-port 5000`);
      process.exit(1);
    } else {
      logger.error(`Server error: ${err.message}`);
    }
  });
}

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

start();
