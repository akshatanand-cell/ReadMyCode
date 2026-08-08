const { callAI } = require("./aiService");
const { architecturePrompt } = require("../utils/promptTemplates");
const { extractMermaid } = require("./flowchartGenerator");

/**
 * Produces a Mermaid.js architecture diagram (client/server/db/services)
 * based purely on the file tree - useful even before deep code parsing.
 */
async function generateArchitecture({ repoName, tree }) {
  const prompt = architecturePrompt({ repoName, tree });
  const raw = await callAI(prompt, { maxTokens: 1500, type: "architecture" });
  return extractMermaid(raw);
}

module.exports = { generateArchitecture };
