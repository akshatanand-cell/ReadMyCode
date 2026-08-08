const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { walkRepo } = require("../utils/fileWalker");
const { explainFunctions } = require("../services/functionExplainer");
const memoryStore = require("../utils/memoryStore");
const { fetchRepoHelper, isDbConnected } = require("../utils/repoFetcher");

async function buildFunctions(repo) {
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (!localPath) {
    const err = new Error("Repo has not been cloned/parsed yet");
    err.status = 400;
    throw err;
  }

  const allFiles = walkRepo(localPath, { onlyCode: true });
  const explanations = await explainFunctions(allFiles, { limit: 25 });

  if (isDbConnected()) {
    return AnalysisResult.create({
      repo: repo._id,
      owner: repo.owner,
      type: "functionExplain",
      content: explanations,
    });
  } else {
    return memoryStore.createAnalysis({
      repo: repo._id,
      owner: repo.owner,
      type: "functionExplain",
      content: explanations,
    });
  }
}

async function createFunctionExplanations(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const result = await buildFunctions(repo);
    res.status(201).json({ result, functions: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

async function getFunctionExplanations(req, res, next) {
  try {
    const repo = await fetchRepoHelper(req.params.repoId, req.user._id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    let result;
    if (isDbConnected()) {
      result = await AnalysisResult.findOne({ repo: repo._id, type: "functionExplain" }).sort({ createdAt: -1 });
    } else {
      result = await memoryStore.findAnalysis(repo._id, "functionExplain");
    }

    if (!result) result = await buildFunctions(repo);

    res.json({ result, functions: result.content });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

module.exports = { createFunctionExplanations, getFunctionExplanations };
