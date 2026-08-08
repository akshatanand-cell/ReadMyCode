const { callAI } = require("./aiService");
const { flowchartPrompt } = require("../utils/promptTemplates");

function extractMermaid(text) {
  const match = text.match(/```mermaid\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/**
 * Produces Mermaid.js "graph TD" syntax describing the app's execution flow.
 * Client renders this string directly with mermaid.js / react-flow.
 */
async function generateFlowchart({ repoName, tree, entryFileContent }) {
  const prompt = flowchartPrompt({ repoName, tree, entryFileContent });
  const raw = await callAI(prompt, { maxTokens: 1500 });
  return extractMermaid(raw);
}

module.exports = { generateFlowchart, extractMermaid };
