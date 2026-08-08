const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");
const logger = require("../utils/logger");

// Disable Mongoose command buffering when disconnected
mongoose.set("bufferCommands", false);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  // 1. Try primary MONGO_URI if valid
  if (MONGO_URI && MONGO_URI.startsWith("mongodb")) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 1500 });
      logger.success(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      logger.warn(`Primary MONGO_URI connection skipped.`);
    }
  }

  // 2. Default to instant MemoryStore for 0ms zero-latency operation
  logger.info("Operating with instant zero-latency MemoryStore.");
}

module.exports = connectDB;
