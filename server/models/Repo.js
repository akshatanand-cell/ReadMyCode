const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repoUrl: { type: String, required: true },
    repoName: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
    fileTree: { type: mongoose.Schema.Types.Mixed }, // nested tree snapshot
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
