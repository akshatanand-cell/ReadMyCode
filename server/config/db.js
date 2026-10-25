const dns = require("dns");
const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");
const logger = require("../utils/logger");

// Only override DNS servers in local development when campus/local Wi-Fi blocks SRV.
// On Vercel / AWS Lambda, NEVER call setServers because Lambda requires AWS's internal VPC DNS.
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch (_dnsErr) {
    // Ignore in restricted environments
  }
}

// Disable Mongoose command buffering when disconnected
mongoose.set("bufferCommands", false);

// Optional Direct Atlas Replica Set connection string via environment variable
const DIRECT_ATLAS_URI = process.env.DIRECT_ATLAS_URI || "";

function synthesizeDirectAtlasUri(srvUri) {
  if (!srvUri || !srvUri.startsWith("mongodb+srv://")) return null;
  const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?(?:\?(.*))?$/);
  if (!match) return null;
  const [, user, pass, host, dbName = "readmycode"] = match;
  if (host.includes("adjhdtc.mongodb.net")) {
    return `mongodb://${user}:${pass}@ac-o6xtntj-shard-00-00.adjhdtc.mongodb.net:27017,ac-o6xtntj-shard-00-01.adjhdtc.mongodb.net:27017,ac-o6xtntj-shard-00-02.adjhdtc.mongodb.net:27017/${dbName || "readmycode"}?ssl=true&replicaSet=atlas-hhbls7-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
  return null;
}

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

  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
    maxPoolSize: isProduction ? 5 : 10,
  };

  // 1. Try primary configured MONGO_URI
  if (MONGO_URI && MONGO_URI.startsWith("mongodb")) {
    try {
      cachedPromise = mongoose.connect(MONGO_URI, connectOptions);
      await cachedPromise;
      logger.success(`MongoDB connected via Primary URI: ${mongoose.connection.host}`);
      global.__lastDbError = null;
      return mongoose.connection;
    } catch (err) {
      logger.warn(`Primary MONGO_URI connection attempt failed: ${err.message}`);
      global.__lastDbError = err.message;
      cachedPromise = null;
    }
  }

  // 2. Direct Replica Set fallback (from env or synthesized from SRV URI)
  const directTargetUri = DIRECT_ATLAS_URI || synthesizeDirectAtlasUri(MONGO_URI);
  if (directTargetUri && directTargetUri.startsWith("mongodb")) {
    try {
      cachedPromise = mongoose.connect(directTargetUri, {
        ...connectOptions,
        serverSelectionTimeoutMS: 6000,
      });
      await cachedPromise;
      logger.success(`MongoDB connected via Direct Replica Set: ${mongoose.connection.host}`);
      global.__lastDbError = null;
      return mongoose.connection;
    } catch (err) {
      logger.error(`Direct Atlas connection failed: ${err.message}`);
      global.__lastDbError = err.message;
      cachedPromise = null;
    }
  }

  // 3. Graceful degradation: operate with instant MemoryStore rather than blocking users
  logger.warn("Operating with instant fallback MemoryStore to ensure uninterrupted user service.");
}

module.exports = connectDB;
