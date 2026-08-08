const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const memoryStore = require("./memoryStore");
const logger = require("./logger");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function fetchRepoHelper(repoId, ownerId) {
  let repo = null;

  // 1. Try finding by ID in Mongoose
  if (isDbConnected()) {
    try {
      if (repoId && mongoose.Types.ObjectId.isValid(repoId)) {
        repo = await Repo.findOne({ _id: repoId });
      }
      if (!repo) {
        repo = await Repo.findOne().sort({ createdAt: -1 });
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

  // 3. Fallback: If no repo found in DB or memoryStore, locate or create fallback repo
  if (!repo) {
    const tempDir = path.join(__dirname, "../temp_repos");
    let localPath = tempDir;

    if (fs.existsSync(tempDir)) {
      const entries = fs.readdirSync(tempDir, { withFileTypes: true }).filter((d) => d.isDirectory());
      if (entries.length > 0) {
        localPath = path.join(tempDir, entries[entries.length - 1].name);
      }
    }

    const defaultData = {
      owner: ownerId || "demo_owner",
      repoUrl: "https://github.com/akshatanand-cell/expense-tracker",
      repoName: "expense-tracker",
      status: "ready",
    };

    if (isDbConnected()) {
      repo = await Repo.create(defaultData);
    } else {
      repo = await memoryStore.createRepo(defaultData);
    }

    repo.set("localPath", localPath, { strict: false });
    await repo.save();
  }

  // Ensure localPath is set if missing
  if (!repo.get || !repo.get("localPath")) {
    const tempDir = path.join(__dirname, "../temp_repos");
    let localPath = tempDir;
    if (fs.existsSync(tempDir)) {
      const entries = fs.readdirSync(tempDir, { withFileTypes: true }).filter((d) => d.isDirectory());
      if (entries.length > 0) {
        localPath = path.join(tempDir, entries[entries.length - 1].name);
      }
    }
    if (repo.set) repo.set("localPath", localPath, { strict: false });
    else repo.localPath = localPath;
  }

  return repo;
}

module.exports = { fetchRepoHelper, isDbConnected };
