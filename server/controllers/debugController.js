const mongoose = require("mongoose");
const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { debugError } = require("../services/debuggerEngine");
const memoryStore = require("../utils/memoryStore");

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Accepts a pasted error/stack trace (+ optional relevant code snippet) and
 * an optional repoId to associate the debug session with. Does not require
 * a cloned repo, so it works even for quick one-off pastes during a demo.
 */
async function runDebugger(req, res, next) {
  try {
    const { errorTrace, relevantCode, repoId } = req.body;
    if (!errorTrace) return res.status(400).json({ message: "errorTrace is required" });

    const analysis = await debugError({ errorTrace, relevantCode });

    let result;
    const ownerId = req.user?._id || "demo_guest";
    if (repoId) {
      if (isDbConnected()) {
        const repo = await Repo.findOne({ _id: repoId });
        if (repo) {
          result = await AnalysisResult.create({
            repo: repo._id,
            owner: ownerId,
            type: "debug",
            content: analysis,
            meta: { errorTrace },
          });
        }
      } else {
        result = await memoryStore.createAnalysis({
          repo: repoId,
          owner: ownerId,
          type: "debug",
          content: analysis,
          meta: { errorTrace },
        });
      }
    }

    res.json({ result: result || { content: analysis } });
  } catch (err) {
    next(err);
  }
}

module.exports = { runDebugger };
