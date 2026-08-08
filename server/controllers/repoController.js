const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const AdmZip = require("adm-zip");
const Repo = require("../models/Repo");
const { cloneRepo, cleanupRepo, parseRepoUrl } = require("../services/githubService");
const { walkRepo, getTree } = require("../utils/fileWalker");
const logger = require("../utils/logger");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function analyzeRepo(req, res, next) {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ message: "repoUrl is required" });

    const { owner: ghOwner, repo: repoName } = parseRepoUrl(repoUrl);
    const ownerId = req.user?._id || req.user?.id || "demo_owner";

    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.create({
        owner: ownerId,
        repoUrl,
        repoName: repoName || "expense-tracker",
        status: "cloning",
      });
    } else {
      repoDoc = await memoryStore.createRepo({
        owner: ownerId,
        repoUrl,
        repoName: repoName || "expense-tracker",
        status: "cloning",
      });
    }

    const { localPath } = await cloneRepo(repoUrl);

    repoDoc.status = "parsing";
    await repoDoc.save();

    const tree = getTree(localPath);
    repoDoc.fileTree = tree;
    repoDoc.status = "ready";
    repoDoc.set("localPath", localPath, { strict: false });
    await repoDoc.save();

    res.status(201).json({
      repo: repoDoc,
      message: "Repo cloned and parsed successfully",
    });
  } catch (err) {
    logger.error(`analyzeRepo failed: ${err.message}`);
    next(err);
  }
}

async function analyzeZip(req, res, next) {
  const zipPath = req.file?.path;
  try {
    if (!zipPath) return res.status(400).json({ message: "No ZIP file uploaded" });

    const repoName = path.basename(req.file.originalname, ".zip");
    const extractDir = zipPath.replace(/\.zip$/i, "");

    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.create({
        owner: req.user._id,
        repoUrl: `zip-upload:${req.file.originalname}`,
        repoName,
        status: "parsing",
      });
    } else {
      repoDoc = await memoryStore.createRepo({
        owner: req.user._id,
        repoUrl: `zip-upload:${req.file.originalname}`,
        repoName,
        status: "parsing",
      });
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const entries = fs.readdirSync(extractDir, { withFileTypes: true });
    const effectiveRoot =
      entries.length === 1 && entries[0].isDirectory()
        ? path.join(extractDir, entries[0].name)
        : extractDir;

    const tree = getTree(effectiveRoot);
    repoDoc.fileTree = tree;
    repoDoc.status = "ready";
    repoDoc.set("localPath", effectiveRoot, { strict: false });
    await repoDoc.save();

    fs.unlink(zipPath, () => {});

    res.status(201).json({
      repo: repoDoc,
      message: "ZIP uploaded and parsed successfully",
    });
  } catch (err) {
    if (zipPath) fs.unlink(zipPath, () => {});
    logger.error(`analyzeZip failed: ${err.message}`);
    next(err);
  }
}

async function getRepo(req, res, next) {
  try {
    let repo;
    if (isDbConnected()) {
      repo = await Repo.findOne({ _id: req.params.id, owner: req.user._id });
    } else {
      repo = await memoryStore.findRepoById(req.params.id, req.user._id);
    }
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    res.json({ repo });
  } catch (err) {
    next(err);
  }
}

async function listRepos(req, res, next) {
  try {
    let repos;
    if (isDbConnected()) {
      repos = await Repo.find({ owner: req.user._id }).sort({ createdAt: -1 });
    } else {
      repos = await memoryStore.listUserRepos(req.user._id);
    }
    res.json({ repos });
  } catch (err) {
    next(err);
  }
}

async function deleteRepo(req, res, next) {
  try {
    let repo;
    if (isDbConnected()) {
      repo = await Repo.findOne({ _id: req.params.id, owner: req.user._id });
    } else {
      repo = await memoryStore.findRepoById(req.params.id, req.user._id);
    }
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    const localPath = repo.get("localPath");
    if (localPath) cleanupRepo(localPath);

    await repo.deleteOne();
    res.json({ message: "Repo deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyzeRepo, analyzeZip, getRepo, listRepos, deleteRepo };