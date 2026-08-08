const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["readme", "apiDocs", "flowchart", "architecture", "functionExplain", "debug"],
      required: true,
    },
    // For functionExplain: keyed by file path. For debug: single result. Others: raw content.
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    meta: { type: mongoose.Schema.Types.Mixed }, // e.g. { filePath, functionName } for functionExplain
  },
  { timestamps: true }
);

analysisResultSchema.index({ repo: 1, type: 1 });

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);
