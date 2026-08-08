const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { walkRepo } = require("../utils/fileWalker");
const { generateFlowchart } = require("../services/flowchartGenerator");
const { generateArchitecture } = require("../services/architectureGenerator");
const memoryStore = require("../utils/memoryStore");
const { fetchRepoHelper, isDbConnected } = require("../utils/repoFetcher");

const ENTRY_CANDIDATES = ["server.js", "app.js", "index.js", "main.py", "src/main.jsx", "src/App.jsx"];

function findEntryFile(localPath) {
  for (const candidate of ENTRY_CANDIDATES) {
    const full = path.join(localPath, candidate);
    if (fs.existsSync(full)) return fs.readFileSync(full, "utf-8");
  }
  return "";
}

async function buildFlowchart(repo) {
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (!localPath) {
    const err = new Error("Repo has not been cloned/parsed yet");
    err.status = 400;
    throw err;
  }

  const allFiles = walkRepo(localPath);
  const tree = allFiles.map((f) => f.path).join("\n");
  const entryFileContent = findEntryFile(localPath);

  const mermaid = await generateFlowchart({ repoName: repo.repoName || repo.name || "Repository", tree, entryFileContent });

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
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (!localPath) {
    const err = new Error("Repo has not been cloned/parsed yet");
    err.status = 400;
    throw err;
  }

  const allFiles = walkRepo(localPath);
  const tree = allFiles.map((f) => f.path).join("\n");

  const mermaid = await generateArchitecture({ repoName: repo.repoName || repo.name || "Repository", tree });

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
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
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
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({ repo: repo._id, type: "flowchart" }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "flowchart");
    }

    if (!result) result = await buildFlowchart(repo);

    res.json({ result, flowchart: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function createArchitectureDiagram(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
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
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({ repo: repo._id, type: "architecture" }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "architecture");
    }

    if (!result) result = await buildArchitecture(repo);

    res.json({ result, architecture: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

module.exports = { createFlowchart, getFlowchart, createArchitectureDiagram, getArchitectureDiagram };
