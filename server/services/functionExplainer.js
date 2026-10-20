const { callAIJson } = require("./aiService");
const { parseFiles } = require("./codeParserService");
const { functionExplainPrompt } = require("../utils/promptTemplates");
const logger = require("../utils/logger");

function createSyntheticExplanation({ file, fn }) {
  const paramList = (fn.params || []).map((p) => ({
    name: p,
    type: "any",
    description: `Input parameter '${p}' supplied to ${fn.name}`,
  }));

  const purpose =
    fn.docstring ||
    `Executes computational logic for ${fn.name}(${(fn.params || []).join(", ")}) within ${file.filePath}.`;

  const example =
    fn.params && fn.params.length > 0
      ? `${fn.name}(${fn.params.map(() => "...").join(", ")})`
      : `${fn.name}()`;

  return {
    filePath: file.filePath,
    functionName: fn.name,
    line: fn.loc || 1,
    purpose,
    parameters: paramList,
    returns: fn.returnType || "any",
    complexity: fn.complexity || "O(N)",
    example,
  };
}

/**
 * Parses the given files with multi-language AST/regex parser, then asks AI or
 * synthesizes structured function cards.
 */
async function explainFunctions(files = [], { limit = 16 } = {}) {
  const parsed = parseFiles(files);
  const candidates = [];

  for (const file of parsed) {
    for (const fn of file.functions) {
      if (candidates.length >= limit) break;
      candidates.push({ file, fn });
    }
    if (candidates.length >= limit) break;
  }

  if (candidates.length === 0) return [];

  const results = await Promise.allSettled(
    candidates.map(async ({ file, fn }) => {
      try {
        const prompt = functionExplainPrompt({ filePath: file.filePath, functionCode: fn.code });
        const explanation = await callAIJson(prompt, { maxTokens: 400, type: "functionExplain" });
        if (explanation && (explanation.purpose || explanation.description)) {
          return {
            filePath: file.filePath,
            functionName: fn.name,
            line: fn.loc || 1,
            purpose: explanation.purpose || explanation.description,
            parameters: explanation.parameters || (fn.params || []).map((p) => ({ name: p, type: "any" })),
            returns: explanation.returns || fn.returnType || "any",
            complexity: explanation.complexity || fn.complexity || "O(N)",
            example: explanation.example || `${fn.name}()`,
          };
        }
      } catch (err) {
        // Fall through to synthetic explanation
      }
      return createSyntheticExplanation({ file, fn });
    })
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}

module.exports = { explainFunctions };
