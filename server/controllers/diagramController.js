const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { generateFlowchart } = require("../services/flowchartGenerator");
const { generateArchitecture } = require("../services/architectureGenerator");
const { generateArchitectureDoc, generateArchitectureMermaid, generateFlowchartMermaid } = require("../services/specDocGenerator");
const memoryStore = require("../utils/memoryStore");
const { fetchRepoHelper, getRepoFiles, isDbConnected } = require("../utils/repoFetcher");

const ENTRY_CANDIDATES = ["server.js", "app.js", "index.js", "main.py", "app.py", "src/main.jsx", "src/App.jsx"];

function findEntryFile(files = [], localPath = "") {
  for (const candidate of ENTRY_CANDIDATES) {
    const found = files.find((f) => (f.path || "").toLowerCase().endsWith(candidate));
    if (found) return found.content;
    if (localPath) {
      const full = path.join(localPath, candidate);
      if (fs.existsSync(full)) return fs.readFileSync(full, "utf-8");
    }
  }
  return files[0]?.content || "";
}

async function buildFlowchart(repo) {
  const allFiles = getRepoFiles(repo);
  const repoName = repo.repoName || repo.name || "Repository";
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  const tree = allFiles.map((f) => f.path).join("\n");
  const entryFileContent = findEntryFile(allFiles, localPath);

  let mermaid = "";
  try {
    mermaid = await generateFlowchart({ repoName, tree, entryFileContent });
  } catch (e) {
    mermaid = generateFlowchartMermaid({ repoName, files: allFiles });
  }

  if (!mermaid || mermaid.toLowerCase().includes("expense-tracker")) {
    mermaid = generateFlowchartMermaid({ repoName, files: allFiles });
  }

  if (isDbConnected()) {
    return AnalysisResult.create({
      repo: repo._id,
      owner: repo.owner,
      type: "flowchart",
      content: mermaid,
    });
  } else {
    return memoryStore.createAnalysis({
      repo: repo._id,
      owner: repo.owner,
      type: "flowchart",
      content: mermaid,
    });
  }
}

async function buildArchitecture(repo) {
  const allFiles = getRepoFiles(repo);
  const repoName = repo.repoName || repo.name || "Repository";
  const tree = allFiles.map((f) => f.path).join("\n");

  let mermaid = "";
  try {
    mermaid = await generateArchitecture({ repoName, tree });
  } catch (e) {
    mermaid = generateArchitectureMermaid({ repoName, files: allFiles });
  }

  if (!mermaid || mermaid.toLowerCase().includes("expense-tracker")) {
    mermaid = generateArchitectureMermaid({ repoName, files: allFiles });
  }

  if (isDbConnected()) {
    return AnalysisResult.create({
      repo: repo._id,
      owner: repo.owner,
      type: "architecture",
      content: mermaid,
    });
  } else {
    return memoryStore.createAnalysis({
      repo: repo._id,
      owner: repo.owner,
      type: "architecture",
      content: mermaid,
    });
  }
}

async function createFlowchart(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user?._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const result = await buildFlowchart(repo);
    res.status(201).json({ result, flowchart: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function getFlowchart(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user?._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({
        $or: [{ repo: repo._id }, { repo: String(repo._id) }],
        type: "flowchart",
      }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "flowchart");
    }

    if (!result || !result.content || result.content.includes("expense-tracker") || result.content.includes("AST Parser & Code Extractor")) {
      result = await buildFlowchart(repo);
    }

    res.json({ result, flowchart: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function createArchitectureDiagram(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user?._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const result = await buildArchitecture(repo);
    res.status(201).json({ result, architecture: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function getArchitectureDiagram(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user?._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({
        $or: [{ repo: repo._id }, { repo: String(repo._id) }],
        type: "architecture",
      }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "architecture");
    }

    if (!result || !result.content || result.content.includes("expense-tracker") || result.content.includes("Analysis Engine & AST Walker") || result.content.startsWith("# ")) {
      result = await buildArchitecture(repo);
    }

    res.json({ result, architecture: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

module.exports = { createFlowchart, getFlowchart, createArchitectureDiagram, getArchitectureDiagram };
