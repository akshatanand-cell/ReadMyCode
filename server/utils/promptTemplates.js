/**
 * Centralized prompt templates so every AI-powered feature is consistent
 * and easy to tune during the demo.
 */

function truncate(str, max = 12000) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "\n... [truncated]" : str;
}

const readmePrompt = ({ repoName, tree, keyFiles }) => `
You are an expert technical writer. Generate a polished, professional README.md
for the GitHub repository "${repoName}".

Project file tree:
${truncate(tree, 4000)}

Key file contents (for context on what the project actually does):
${truncate(keyFiles, 8000)}

Write a complete README.md in Markdown with these sections: Project Title & one-line
description, Features, Tech Stack, Installation, Usage, Project Structure, and
Contributing. Infer the purpose of the project from the code. Return ONLY the
markdown content, no commentary before or after.
`.trim();

const apiDocPrompt = ({ repoName, routeFiles }) => `
You are an expert backend engineer. Analyze the following Express route/controller
files from the repository "${repoName}" and produce API documentation.

Route/controller source:
${truncate(routeFiles, 12000)}

Respond in this exact JSON shape (no markdown fences, no extra text):
{
  "endpoints": [
    {
      "path": "/api/resource",
      "method": "GET",
      "description": "Description of endpoint",
      "parameters": [
        { "name": "id", "type": "string", "required": true, "description": "Resource ID" }
      ],
      "requestBody": { "sampleKey": "value" },
      "response": { "status": "ok" }
    }
  ]
}
`.trim();

const flowchartPrompt = ({ repoName, tree, entryFileContent }) => `
You are a software architect. Based on this repository's structure and entry point,
generate a Mermaid.js flowchart (graph TD syntax) that shows the main execution flow
of the application (request lifecycle, or main script flow).

Repo: ${repoName}
File tree:
${truncate(tree, 3000)}

Entry point file content:
${truncate(entryFileContent, 4000)}

Return ONLY a fenced mermaid code block, nothing else. Example format:
\`\`\`mermaid
graph TD
  A[Client Request] --> B[Router]
\`\`\`
`.trim();

const architecturePrompt = ({ repoName, tree }) => `
You are a software architect. Based on this repository's file tree, generate a
Mermaid.js architecture diagram (graph TD or flowchart LR) showing how major
modules/layers (client, server, database, external services) relate to each other.

Repo: ${repoName}
File tree:
${truncate(tree, 5000)}

Return ONLY a fenced mermaid code block, nothing else.
`.trim();

const functionExplainPrompt = ({ filePath, functionCode }) => `
Explain the following function in plain English for a developer unfamiliar with
this codebase. Be concise but complete.

File: ${filePath}

Function:
\`\`\`
${truncate(functionCode, 3000)}
\`\`\`

Respond in this exact JSON shape (no markdown fences, no extra text):
{
  "summary": "one sentence summary",
  "parameters": [{"name": "paramName", "purpose": "what it's for"}],
  "returns": "what the function returns",
  "complexity": "low | medium | high",
  "notes": "edge cases, side effects, or gotchas worth knowing"
}
`.trim();

const debuggerPrompt = ({ errorTrace, relevantCode }) => `
You are a senior engineer helping debug an error. Analyze the stack trace and
relevant source code, then explain the root cause and suggest a concrete fix.

Error / stack trace:
${truncate(errorTrace, 4000)}

Relevant source code:
${truncate(relevantCode, 6000)}

Respond in this exact JSON shape (no markdown fences, no extra text):
{
  "rootCause": "plain english explanation of what's going wrong",
  "suggestedFix": "concrete fix, include a small code snippet if helpful",
  "confidence": "low | medium | high"
}
`.trim();

module.exports = {
  truncate,
  readmePrompt,
  apiDocPrompt,
  flowchartPrompt,
  architecturePrompt,
  functionExplainPrompt,
  debuggerPrompt,
};
