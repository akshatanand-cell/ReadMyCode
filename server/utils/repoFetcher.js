const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const memoryStore = require("./memoryStore");
const logger = require("./logger");
const { walkRepo } = require("./fileWalker");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Retrieves the codebase files for a repository.
 * Prefers repo.files stored in MongoDB/memoryStore (essential for serverless & durability),
 * and falls back to localPath if present on the local filesystem.
 */
function getRepoFiles(repo) {
  if (!repo) return [];
  if (repo.files && Array.isArray(repo.files) && repo.files.length > 0) {
    return repo.files;
  }
  const localPath = repo.get ? repo.get("localPath") : repo.localPath;
  if (localPath && fs.existsSync(localPath)) {
    return walkRepo(localPath);
  }
  return [];
}

async function fetchRepoHelper(repoId, ownerId) {
  let repo = null;

  // 1. Try finding by ID in Mongoose
  if (isDbConnected()) {
    try {
      if (repoId && mongoose.Types.ObjectId.isValid(repoId)) {
        repo = await Repo.findOne({ _id: repoId });
      }
      if (!repo && repoId) {
        repo = await Repo.findOne({
          $or: [
            { repoUrl: repoId },
            { repoName: repoId },
            { repoUrl: `zip-upload:${repoId}` },
            { repoUrl: `zip-upload:${repoId}.zip` },
          ],
        });
      }
      if (!repo) {
        repo = await Repo.findOne(ownerId && ownerId !== "demo_guest" ? { owner: ownerId } : {}).sort({
          createdAt: -1,
        });
      }
    } catch (err) {
      logger.warn(`Mongoose fetchRepoHelper error: ${err.message}`);
    }
  }

  // 2. Try finding in memoryStore
  if (!repo) {
    try {
      repo = await memoryStore.findRepoById(repoId, ownerId);
    } catch (err) {
      logger.warn(`memoryStore fetchRepoHelper error: ${err.message}`);
    }
  }

  // 3. Resilient fallback for serverless: if repo was not found by ID, grab the user's latest repo
  if (!repo && isDbConnected()) {
    try {
      if (ownerId && ownerId !== "demo_guest") {
        repo = await Repo.findOne({ owner: ownerId }).sort({ createdAt: -1 });
      }
      if (!repo) {
        repo = await Repo.findOne({}).sort({ createdAt: -1 });
      }
    } catch (err) {
      logger.warn(`Latest repo fallback error: ${err.message}`);
    }
  }

  return repo;
}

module.exports = { fetchRepoHelper, getRepoFiles, isDbConnected };
