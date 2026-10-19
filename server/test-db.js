// Test MongoDB Connection
try {
  require("dns").setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (_e) {}

const path = require("path");
const fs = require("fs");

const parentEnv = path.join(__dirname, "..", ".env");
const localEnv = path.join(__dirname, ".env");
const envPath = fs.existsSync(parentEnv) ? parentEnv : localEnv;

require("dotenv").config({ path: envPath });
const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("No MONGO_URI found in environment file (.env)");
  process.exit(1);
}

console.log("Connecting to MongoDB Atlas using Google DNS...");

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log("Connected:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    return mongoose.disconnect();
  })
  .then(() => {
    console.log("Database connection test passed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
