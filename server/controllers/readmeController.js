const path = require("path");
const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { walkRepo } = require("../utils/fileWalker");
const { generateReadme } = require("../services/readmeGenerator");
const logger = require("../utils/logger");
const memoryStore = require("../utils/memoryStore");
const { fetchRepoHelper, isDbConnected } = require("../utils/repoFetcher");

const KEY_FILE_NAMES = ["package.json", "README.md", "index.js", "app.js", "server.js", "main.py"];

async function buildReadme(repo) {
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (!localPath) {
    const err = new Error("Repo has not been cloned/parsed yet");
    err.status = 400;
    throw err;
  }

  const allFiles = walkRepo(localPath);
  const keyFiles = allFiles
    .filter((f) => KEY_FILE_NAMES.includes(path.basename(f.path)))
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const treeSummary = allFiles.map((f) => f.path).join("\n");

  const markdown = await generateReadme({
    repoName: repo.repoName || repo.name || "Repository",
    tree: treeSummary,
    keyFiles,
  });

  if (isDbConnected()) {
    return AnalysisResult.create({
      repo: repo._id,
      owner: repo.owner,
      type: "readme",
      content: markdown,
    });
  } else {
    return memoryStore.createAnalysis({
      repo: repo._id,
      owner: repo.owner,
      type: "readme",
      content: markdown,
    });
  }
}

async function createReadme(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const result = await buildReadme(repo);
    res.status(201).json({ result, readme: result.content });
  } catch (err) {
    logger.error(`createReadme failed: ${err.message}`);
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function getReadme(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({ repo: repo._id, type: "readme" }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "readme");
    }

    if (!result) result = await buildReadme(repo);

    res.json({ result, readme: result.content });
  } catch (err) {
    logger.error(`getReadme failed: ${err.message}`);
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

module.exports = { createReadme, getReadme };