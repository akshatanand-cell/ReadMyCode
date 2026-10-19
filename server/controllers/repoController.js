const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const AdmZip = require("adm-zip");
const Repo = require("../models/Repo");
const { cloneRepo, cleanupRepo, parseRepoUrl, pushCodeToGitHub } = require("../services/githubService");
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
    return res.status(500).json({ message: err.message || "Failed to analyze repository" });
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

    let githubPushInfo = null;
    const shouldPush = req.body.pushToGithub === "true" || req.body.pushToGithub === true;
    const githubToken = req.body.githubToken || req.user?.githubToken || process.env.GITHUB_TOKEN;

    if (shouldPush && githubToken) {
      try {
        const pushResult = await pushCodeToGitHub({
          token: githubToken,
          repoName: req.body.customRepoName || repoName,
          description: req.body.description || "Documented and exported via ReadMyCode",
          localPath: effectiveRoot,
          isPrivate: req.body.isPrivate === "true" || req.body.isPrivate === true,
        });
        repoDoc.repoUrl = pushResult.htmlUrl;
        repoDoc.githubUrl = pushResult.htmlUrl;
        repoDoc.owner = pushResult.owner;
        repoDoc.repoName = pushResult.repoName;
        await repoDoc.save();
        githubPushInfo = pushResult;
      } catch (pushErr) {
        logger.warn(`Automatic GitHub push skipped: ${pushErr.message}`);
      }
    }

    fs.unlink(zipPath, () => {});

    res.status(201).json({
      repo: repoDoc,
      github: githubPushInfo,
      message: githubPushInfo
        ? "ZIP uploaded, analyzed, and pushed to your GitHub account!"
        : "ZIP uploaded and parsed successfully",
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
      if (!repo && mongoose.Types.ObjectId.isValid(req.params.id)) {
        repo = await Repo.findOne({ _id: req.params.id });
      }
    } else {
      repo = await memoryStore.findRepoById(req.params.id, req.user._id);
    }
    if (!repo) return res.status(404).json({ message: "Repo not found" });
    res.json({ repo });
  } catch (err) {
    next(err);
  }
}

async function reanalyzeRepo(req, res, next) {
  try {
    const { id } = req.params;
    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.findById(id);
    } else {
      repoDoc = await memoryStore.findRepoById(id, req.user?._id);
    }

    if (!repoDoc) {
      return res.status(404).json({ message: "Repo not found" });
    }

    let localPath = repoDoc.get ? repoDoc.get("localPath") : repoDoc.localPath;
    if (!localPath || !fs.existsSync(localPath)) {
      if (repoDoc.repoUrl && !repoDoc.repoUrl.startsWith("zip-upload:")) {
        const cloned = await cloneRepo(repoDoc.repoUrl);
        localPath = cloned.localPath;
        if (repoDoc.set) repoDoc.set("localPath", localPath, { strict: false });
        else repoDoc.localPath = localPath;
      }
    }

    if (localPath && fs.existsSync(localPath)) {
      const tree = getTree(localPath);
      repoDoc.fileTree = tree;
      repoDoc.status = "ready";
      await repoDoc.save();
    } else {
      repoDoc.status = "ready";
      await repoDoc.save();
    }

    res.json({
      repo: repoDoc,
      message: "Repo re-analyzed successfully",
    });
  } catch (err) {
    logger.error(`reanalyzeRepo failed: ${err.message}`);
    return res.status(500).json({ message: err.message || "Failed to re-analyze repository" });
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

    const localPath = repo.get ? repo.get("localPath") : repo.localPath;
    if (localPath) cleanupRepo(localPath);

    await repo.deleteOne();
    res.json({ message: "Repo deleted" });
  } catch (err) {
    next(err);
  }
}

async function pushRepoToGitHub(req, res, next) {
  try {
    const { id } = req.params;
    const { token, repoName, isPrivate, description } = req.body;

    const githubToken = token || req.user?.githubToken || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(400).json({
        message: "GitHub Personal Access Token is required to push to GitHub.",
      });
    }

    let repoDoc;
    if (isDbConnected()) {
      repoDoc = await Repo.findById(id);
    } else {
      repoDoc = await memoryStore.findRepoById(id, req.user?._id);
    }

    if (!repoDoc) {
      return res.status(404).json({ message: "Repository not found" });
    }

    const localPath = repoDoc.get ? repoDoc.get("localPath") : repoDoc.localPath;
    if (!localPath || !fs.existsSync(localPath)) {
      return res.status(400).json({
        message: "Codebase directory is no longer stored locally. Please re-upload the ZIP to push to GitHub.",
      });
    }

    const finalRepoName = repoName || repoDoc.repoName || repoDoc.name || "readmycode-project";

    const pushResult = await pushCodeToGitHub({
      token: githubToken,
      repoName: finalRepoName,
      description: description || "Documented and exported via ReadMyCode",
      localPath,
      isPrivate: Boolean(isPrivate),
    });

    repoDoc.repoUrl = pushResult.htmlUrl;
    repoDoc.githubUrl = pushResult.htmlUrl;
    repoDoc.owner = pushResult.owner;
    repoDoc.repoName = pushResult.repoName;
    await repoDoc.save();

    res.json({
      success: true,
      message: "Successfully created and pushed repository to your GitHub account!",
      githubUrl: pushResult.htmlUrl,
      repo: repoDoc,
    });
  } catch (err) {
    logger.error(`pushRepoToGitHub failed: ${err.message}`);
    return res.status(500).json({ message: err.message || "Failed to push repository to GitHub" });
  }
}

module.exports = { analyzeRepo, analyzeZip, getRepo, reanalyzeRepo, listRepos, deleteRepo, pushRepoToGitHub };