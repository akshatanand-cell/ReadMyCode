const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { CLIENT_URL, NODE_ENV } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const repoRoutes = require("./routes/repoRoutes");
const readmeRoutes = require("./routes/readmeRoutes");
const docsRoutes = require("./routes/docsRoutes");
const diagramRoutes = require("./routes/diagramRoutes");
const debugRoutes = require("./routes/debugRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Trust reverse proxy (Vercel, AWS, Cloudflare) so req.ip and rate limiters resolve real client IPs
app.set("trust proxy", 1);

// Strict CORS: allow custom domain, canonical Vercel domains, and configured client URL
const allowedOriginSet = new Set(
  [
    "https://readmycode.vercel.app",
    "https://read-my-code.vercel.app",
    CLIENT_URL,
    NODE_ENV !== "production" ? "http://localhost:5173" : null,
    NODE_ENV !== "production" ? "http://localhost:3000" : null,
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile)
      if (!origin) return callback(null, true);

      // Check exact allowlist
      if (allowedOriginSet.has(origin)) {
        return callback(null, true);
      }

      // Allow official Vercel preview deploys for this project
      if (/^https:\/\/readmycode(-[a-z0-9]+)*-akshat[a-z0-9-]*\.vercel\.app$/.test(origin)) {
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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? "mongo" : "memory",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/readme", readmeRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/diagrams", diagramRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
