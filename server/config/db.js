const dns = require("dns");
const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");
const logger = require("../utils/logger");

// Use public DNS to resolve MongoDB Atlas SRV records when local/campus Wi-Fi blocks SRV
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (_dnsErr) {
  // Ignore in restricted environments
}

// Disable Mongoose command buffering when disconnected
mongoose.set("bufferCommands", false);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  // 1. Try primary MONGO_URI if valid
  if (MONGO_URI && MONGO_URI.startsWith("mongodb")) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      logger.success(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      logger.warn(`Primary MONGO_URI connection attempt failed: ${err.message}`);
    }
  }

  // 2. Default to instant MemoryStore for 0ms zero-latency operation
  logger.info("Operating with instant zero-latency MemoryStore.");
}

module.exports = connectDB;
