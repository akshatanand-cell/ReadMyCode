const { callAIJson } = require("./aiService");
const { parseFiles } = require("./codeParserService");
const { functionExplainPrompt } = require("../utils/promptTemplates");
const logger = require("../utils/logger");

/**
 * Parses the given files with the AST parser, then asks the AI to explain
 * each discovered function in plain English. Returns a per-file map of
 * function name -> explanation, so the frontend can render one card per function.
 */
async function explainFunctions(files, { limit = 8 } = {}) {
  const parsed = parseFiles(files);
  const candidates = [];

  for (const file of parsed) {
    for (const fn of file.functions) {
      if (candidates.length >= limit) break;
      candidates.push({ file, fn });
    }
    if (candidates.length >= limit) break;
  }

  const results = await Promise.allSettled(
    candidates.map(async ({ file, fn }) => {
      try {
        const prompt = functionExplainPrompt({ filePath: file.filePath, functionCode: fn.code });
        const explanation = await callAIJson(prompt, { maxTokens: 400, type: "functionExplain" });
        return {
          filePath: file.filePath,
          functionName: fn.name,
          line: fn.loc,
          ...explanation,
        };
      } catch (err) {
        logger.warn(`Skipping explanation for ${fn.name} in ${file.filePath}: ${err.message}`);
        return null;
      }
    })
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}

module.exports = { explainFunctions };
