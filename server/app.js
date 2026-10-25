const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { CLIENT_URL, NODE_ENV } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { createRateLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const repoRoutes = require("./routes/repoRoutes");
const readmeRoutes = require("./routes/readmeRoutes");
const docsRoutes = require("./routes/docsRoutes");
const diagramRoutes = require("./routes/diagramRoutes");
const debugRoutes = require("./routes/debugRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Strict CORS: allow custom domain, preview domains, and configured client URLs
const allowedOrigins = [
  "https://readmycode.vercel.app",
  "https://read-my-code.vercel.app",
  CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Check allowed list or Vercel preview deploys for this project
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/readmycode(-[a-z0-9-]+)?\.vercel\.app$/.test(origin) ||
        /^https:\/\/read-my-code(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} is not authorized.`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
if (NODE_ENV !== "test") app.use(morgan("dev"));

// API Rate Limiter to protect AI endpoints and prevent quota draining
const analysisLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 analyses per IP per 15 minutes
  message: "Analysis request quota reached. Please wait a few minutes or provide your GitHub Personal Access Token.",
});

app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #0b1120; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-center;">
      <h1 style="color: #38bdf8;">🚀 ReadMyCode Backend API</h1>
      <p style="font-size: 18px; color: #94a3b8;">REST API server running.</p>
      <div style="margin-top: 20px; padding: 20px; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">Live Web Application:</p>
        <a href="${CLIENT_URL || 'https://readmycode.vercel.app'}" style="display: inline-block; background: #10b981; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Open ReadMyCode App
        </a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">API Health Check: <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
    </div>
  `);
});

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/repos", analysisLimiter, repoRoutes);
app.use("/api/readme", readmeRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/diagrams", diagramRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
