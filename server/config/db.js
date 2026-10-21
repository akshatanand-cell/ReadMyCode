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

// Optional Direct Atlas Replica Set connection string via environment variable
const DIRECT_ATLAS_URI = process.env.DIRECT_ATLAS_URI || "";

let cachedPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      if (mongoose.connection.readyState === 1) return mongoose.connection;
    } catch (_err) {
      cachedPromise = null;
    }
  }

  // 1. Try primary configured MONGO_URI
  if (MONGO_URI && MONGO_URI.startsWith("mongodb")) {
    try {
      cachedPromise = mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      });
      await cachedPromise;
      logger.success(`MongoDB connected via Primary URI: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      logger.warn(`Primary MONGO_URI connection attempt failed: ${err.message}`);
      cachedPromise = null;
    }
  }

  // 2. Direct Replica Set fallback if configured via environment variable
  if (DIRECT_ATLAS_URI && DIRECT_ATLAS_URI.startsWith("mongodb")) {
    try {
      cachedPromise = mongoose.connect(DIRECT_ATLAS_URI, {
        serverSelectionTimeoutMS: 6000,
        bufferCommands: false,
      });
      await cachedPromise;
      logger.success(`MongoDB connected via Direct Replica Set: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      logger.error(`Direct Atlas connection failed: ${err.message}`);
      cachedPromise = null;
    }
  }

  // 3. Fallback to instant MemoryStore
  logger.info("Operating with instant zero-latency MemoryStore.");
}

module.exports = connectDB;
