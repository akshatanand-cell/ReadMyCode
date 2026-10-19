const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load default dotenv
dotenv.config();

// Also try loading server/.env and root .env explicitly if available
const serverEnv = path.resolve(__dirname, "../.env");
const rootEnv = path.resolve(__dirname, "../../.env");
if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });

const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.GROQ_API_KEY || "";
if (!process.env.XAI_API_KEY && apiKey) {
  process.env.XAI_API_KEY = apiKey;
}

const required = ["MONGO_URI", "JWT_SECRET"];
if (!apiKey) required.push("XAI_API_KEY");

const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === "" || /^_+$/.test(process.env[key]));

if (missing.length > 0) {
  console.warn(
    `[env] Warning: the following env vars are missing or still placeholders: ${missing.join(", ")}. ` +
    `Fill them in .env before running the full pipeline.`
  );
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/readmycode",
  JWT_SECRET: process.env.JWT_SECRET || "readmycode_jwt_secret_key_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  XAI_API_KEY: apiKey,
  AI_MODEL: process.env.AI_MODEL || "grok-2-latest",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",
};