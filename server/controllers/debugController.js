const Repo = require("../models/Repo");
const AnalysisResult = require("../models/AnalysisResult");
const { debugError } = require("../services/debuggerEngine");

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
    if (repoId) {
      const repo = await Repo.findOne({ _id: repoId, owner: req.user._id });
      if (repo) {
        result = await AnalysisResult.create({
          repo: repo._id,
          owner: req.user._id,
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
