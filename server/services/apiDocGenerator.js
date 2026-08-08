const { callAIJson } = require("./aiService");
const { apiDocPrompt } = require("../utils/promptTemplates");

/**
 * Generates API documentation structured JSON by feeding route/controller source
 * files to the AI. Expects `files` to be an array of {path, content}.
 */
async function generateApiDocs({ repoName, files }) {
  const routeFiles = files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join("\n\n");

  const prompt = apiDocPrompt({ repoName, routeFiles });
  const result = await callAIJson(prompt, { maxTokens: 3000, type: "apiDocs" });
  return result;
}

module.exports = { generateApiDocs };
