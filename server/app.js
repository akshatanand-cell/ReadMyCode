const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
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

const allowedOrigins = [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #0b1120; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-center;">
      <h1 style="color: #38bdf8;">🚀 ReadMyCode Backend API is Running</h1>
      <p style="font-size: 18px; color: #94a3b8;">This is the REST API server on port 5000.</p>
      <div style="margin-top: 20px; padding: 20px; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">To view the Web Application User Interface (UI):</p>
        <a href="${CLIENT_URL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Open Web App (${CLIENT_URL})
        </a>
      </div>
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">API Health Check: <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
    </div>
  `);
});

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/readme", readmeRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/diagrams", diagramRoutes); // flowchart, architecture, functions
app.use("/api/debug", debugRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
