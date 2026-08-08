const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function getStats(req, res, next) {
  try {
    const ownerId = req.user._id;

    if (isDbConnected()) {
      const [totalRepos, readyRepos, failedRepos, totalAnalyses] = await Promise.all([
        Repo.countDocuments({ owner: ownerId }),
        Repo.countDocuments({ owner: ownerId, status: "ready" }),
        Repo.countDocuments({ owner: ownerId, status: "failed" }),
        AnalysisResult.countDocuments({ owner: ownerId }),
      ]);

      return res.json({
        totalRepos,
        readyRepos,
        failedRepos,
        totalAnalyses,
      });
    } else {
      const userRepos = await memoryStore.listUserRepos(ownerId);
      const readyRepos = userRepos.filter((r) => r.status === "ready").length;
      const failedRepos = userRepos.filter((r) => r.status === "failed").length;
      const totalAnalyses = memoryStore.memoryDb.analysisResults.filter(
        (a) => String(a.owner) === String(ownerId)
      ).length;

      return res.json({
        totalRepos: userRepos.length,
        readyRepos,
        failedRepos,
        totalAnalyses,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function getRecent(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);

    let repos;
    if (isDbConnected()) {
      repos = await Repo.find({ owner: req.user._id })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select("repoName repoUrl status createdAt updatedAt");
    } else {
      const userRepos = await memoryStore.listUserRepos(req.user._id);
      repos = userRepos.slice(0, limit);
    }

    res.json({ repos });
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    let activity;
    if (isDbConnected()) {
      activity = await AnalysisResult.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("repo", "repoName repoUrl")
        .select("type meta createdAt repo");
    } else {
      activity = memoryStore.memoryDb.analysisResults
        .filter((a) => String(a.owner) === String(req.user._id))
        .slice(0, limit);
    }

    res.json({ activity });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRecent, getActivity };