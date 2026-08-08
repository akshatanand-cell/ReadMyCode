const { callAIJson } = require("./aiService");
const { debuggerPrompt } = require("../utils/promptTemplates");

/**
 * Simplest working version (per the build plan): accepts a pasted error /
 * stack trace plus optional relevant source snippet, returns an AI-suggested
 * root cause + fix. No live process attachment - keeps hackathon scope sane.
 */
async function debugError({ errorTrace, relevantCode = "" }) {
  if (!errorTrace || !errorTrace.trim()) {
    throw new Error("errorTrace is required");
  }
  const prompt = debuggerPrompt({ errorTrace, relevantCode });
  return callAIJson(prompt, { maxTokens: 800 });
}

module.exports = { debugError };
