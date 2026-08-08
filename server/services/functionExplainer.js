const { callAIJson } = require("./aiService");
const { parseFiles } = require("./codeParserService");
const { functionExplainPrompt } = require("../utils/promptTemplates");
const logger = require("../utils/logger");

/**
 * Parses the given files with the AST parser, then asks the AI to explain
 * each discovered function in plain English. Returns a per-file map of
 * function name -> explanation, so the frontend can render one card per function.
 */
async function explainFunctions(files, { limit = 25 } = {}) {
  const parsed = parseFiles(files);
  const explanations = [];

  let count = 0;
  for (const file of parsed) {
    for (const fn of file.functions) {
      if (count >= limit) break; // cap AI calls for hackathon demo speed/cost
      count++;
      try {
        const prompt = functionExplainPrompt({ filePath: file.filePath, functionCode: fn.code });
        const explanation = await callAIJson(prompt, { maxTokens: 500, type: "functionExplain" });
        explanations.push({
          filePath: file.filePath,
          functionName: fn.name,
          line: fn.loc,
          ...explanation,
        });
      } catch (err) {
        logger.warn(`Skipping explanation for ${fn.name} in ${file.filePath}: ${err.message}`);
      }
    }
    if (count >= limit) break;
  }

  return explanations;
}

module.exports = { explainFunctions };
