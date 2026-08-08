const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");
const logger = require("../utils/logger");

// Disable Mongoose command buffering when disconnected
mongoose.set("bufferCommands", false);

async function connectDB() {
  // 1. Try primary MONGO_URI
  if (MONGO_URI && MONGO_URI.startsWith("mongodb")) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 1500 });
      logger.success(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      logger.warn(`Primary MONGO_URI connection failed. Trying local fallback...`);
    }
  }

  // 2. Try local MongoDB
  try {
    const localUri = "mongodb://127.0.0.1:27017/readmycode";
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1000 });
    logger.success(`MongoDB connected locally: ${mongoose.connection.host}`);
    return;
  } catch (err) {
    logger.warn(`Local MongoDB unavailable. Trying In-Memory MongoDB Server...`);
  }

  // 3. Try MongoMemoryServer (In-Memory MongoDB)
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    logger.success(`MongoDB Connected via MongoMemoryServer: ${memoryUri}`);
    return;
  } catch (err) {
    logger.warn(`MongoMemoryServer startup skipped. Operating with instant MemoryStore.`);
  }
}

module.exports = connectDB;
