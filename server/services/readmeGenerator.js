const { callAI } = require("./aiService");
const { readmePrompt } = require("../utils/promptTemplates");

/**
 * Generates a README.md string for a repo given its tree and a handful of
 * key files (package.json, entry points) for context.
 */
async function generateReadme({ repoName, tree, keyFiles }) {
  const prompt = readmePrompt({ repoName, tree, keyFiles });
  const markdown = await callAI(prompt, { maxTokens: 3000, type: "readme" });
  return markdown.trim();
}

module.exports = { generateReadme };
