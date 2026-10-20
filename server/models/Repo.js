const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.Mixed, required: true },
    repoUrl: { type: String, required: true },
    repoName: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
    fileTree: { type: mongoose.Schema.Types.Mixed }, // nested tree snapshot
    files: [
      {
        path: { type: String },
        extension: { type: String },
        content: { type: String },
        size: { type: Number },
      },
    ],
    projectType: { type: String, default: "general" }, // 'python' | 'node' | 'web' | 'java' | 'general'
    entryPoint: { type: String },
    githubUrl: { type: String },
    deployUrl: { type: String },
    deployType: { type: String }, // 'streamlit' | 'vercel'
    specDocs: {
      readme: { type: String },
      architecture: { type: String },
      agents: { type: String },
      taskBreakdown: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "cloning", "parsing", "ready", "failed"],
      default: "pending",
    },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
