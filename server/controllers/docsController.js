const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { walkRepo } = require("../utils/fileWalker");
const { generateApiDocs } = require("../services/apiDocGenerator");
const memoryStore = require("../utils/memoryStore");
const { fetchRepoHelper, isDbConnected } = require("../utils/repoFetcher");

// Heuristic: files likely to define API routes/controllers/server logic
function isRouteLikeFile(filePath) {
  return /route|controller|api|server|app|index|main/i.test(filePath) && /\.(js|ts|py|go|java)$/.test(filePath);
}

async function buildDocs(repo) {
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (!localPath) {
    const err = new Error("Repo has not been cloned/parsed yet");
    err.status = 400;
    throw err;
  }

  const allFiles = walkRepo(localPath, { onlyCode: true });
  let routeFiles = allFiles.filter((f) => isRouteLikeFile(f.path));

  if (routeFiles.length === 0) {
    routeFiles = allFiles.slice(0, 10);
  }

  if (routeFiles.length === 0) {
    const err = new Error("No code files detected in this repo");
    err.status = 422;
    throw err;
  }

  const docsData = await generateApiDocs({ repoName: repo.repoName || repo.name || "Repository", files: routeFiles });

  if (isDbConnected()) {
    return AnalysisResult.create({
      repo: repo._id,
      owner: repo.owner,
      type: "apiDocs",
      content: docsData,
    });
  } else {
    return memoryStore.createAnalysis({
      repo: repo._id,
      owner: repo.owner,
      type: "apiDocs",
      content: docsData,
    });
  }
}

async function createApiDocs(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const result = await buildDocs(repo);
    res.status(201).json({ result, docs: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function getApiDocs(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({ repo: repo._id, type: "apiDocs" }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "apiDocs");
    }

    if (!result) result = await buildDocs(repo);

    res.json({ result, docs: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

module.exports = { createApiDocs, getApiDocs };
