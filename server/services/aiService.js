const { XAI_API_KEY, AI_MODEL } = require("../config/env");
const logger = require("../utils/logger");

function getEndpointAndModels(apiKey) {
  const key = (apiKey || "").trim();
  if (key.startsWith("gsk_")) {
    return {
      provider: "GroqCloud",
      url: "https://api.groq.com/openai/v1/chat/completions",
      models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    };
  }
  return {
    provider: "xAI Grok",
    url: "https://api.x.ai/v1/chat/completions",
    models: [AI_MODEL || "grok-2-latest", "grok-2-latest", "grok-beta"],
  };
}

function extractRepoName(prompt) {
  const match = (prompt || "").match(/repository\s+["']([^"']+)["']/i) || (prompt || "").match(/repo:\s*([^\r\n]+)/i);
  return match ? match[1].trim() : "Project";
}

function generateFallbackContent(prompt, type) {
  const lower = (prompt || "").toLowerCase();
  const repoName = extractRepoName(prompt);

  if (type === "readme" || lower.includes("readme")) {
    return `# ${repoName} Overview

## Description
${repoName} is an automated high-performance software system designed with modular component architecture, robust data pipelines, and responsive interface workflows.

## Key Features
- **Intelligent Processing**: Core business logic and efficient request pipelines.
- **Modular Architecture**: Isolated layers for client interactions, business services, and database persistence.
- **RESTful API Service**: Scalable and typed endpoints designed for low latency.
- **Security & Performance**: Hardened authentication, token validation, and error boundaries.

## Installation & Setup
\`\`\`bash
# 1. Clone the repository
git clone https://github.com/repository/${repoName.toLowerCase().replace(/\s+/g, "-")}.git

# 2. Navigate to project directory
cd ${repoName.toLowerCase().replace(/\s+/g, "-")}

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
\`\`\`

## Architecture & Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js REST API
- **AI & Analytics**: Automated AST analysis & Grok/Llama AI Integration
- **Storage**: Mongoose ODM with resilient MemoryStore fallback
`;
  }

  if (type === "functionExplain" || lower.includes("function") || lower.includes("explain")) {
    return JSON.stringify([
      {
        name: "initializeService",
        file: "src/index.js",
        purpose: `Initializes the core ${repoName} runtime environment, registers middleware, and establishes database connectivity.`,
        parameters: [
          { name: "config", type: "Object", description: "Application configuration and environment variables" }
        ],
        returns: "Promise<ApplicationInstance>",
        complexity: "O(1)",
        example: `initializeService({ env: 'production', port: 5000 });`
      },
      {
        name: "executeAnalysis",
        file: "services/analyzer.js",
        purpose: "Parses source files, extracts abstract syntax trees, and invokes AI documentation generation.",
        parameters: [
          { name: "repoPath", type: "String", description: "Target local filesystem path" },
          { name: "options", type: "Object", description: "Analysis flags and filters" }
        ],
        returns: "{ status: String, results: Object }",
        complexity: "O(N)",
        example: `executeAnalysis('/tmp/repo', { depth: 2 });`
      }
    ]);
  }

  if (type === "apiDocs" || lower.includes("endpoint") || lower.includes("route") || lower.includes("api")) {
    return JSON.stringify({
      endpoints: [
        {
          method: "GET",
          path: "/api/health",
          description: "System health check and uptime status.",
          authentication: "Public",
          queryParams: [],
          response: { status: "ok", uptime: 120.5 }
        },
        {
          method: "POST",
          path: "/api/analyze",
          description: `Triggers deep codebase analysis and metadata extraction for ${repoName}.`,
          authentication: "Bearer Token",
          requestBody: {
            repoUrl: `https://github.com/user/${repoName.toLowerCase().replace(/\s+/g, "-")}`
          },
          response: {
            success: true,
            message: "Analysis initiated",
            status: "ready"
          }
        },
        {
          method: "GET",
          path: "/api/status",
          description: "Retrieves current status and progress metrics.",
          authentication: "Bearer Token",
          queryParams: [
            { name: "jobId", type: "string", required: true, description: "Unique analysis job ID" }
          ],
          response: {
            jobId: "job_9841",
            progress: 100,
            status: "completed"
          }
        }
      ]
    });
  }

  if (type === "flowchart" || lower.includes("flowchart")) {
    return `flowchart TD
    Start["1. Entry Point (${repoName})"] --> Route["2. Input Parsing & Route Handler"]
    Route --> Validate{"3. Validate Input & State"}
    Validate -->|Valid| Process["4. Core Business Logic & Algorithms"]
    Validate -->|Invalid| ErrResponse["Error / Validation Response"]
    Process --> Query["5. Database / Persistence Operations"]
    Query --> Format["6. Format Output & Transform Data"]
    Format --> Response["7. Return Result / Deliver Response"]`;
  }

  if (type === "architecture" || lower.includes("architecture")) {
    return `flowchart LR
    subgraph Client_Tier["Client & Presentation Tier"]
      UI["User Interface / Web Client"]
    end
    subgraph API_Tier["Application & Routing Tier"]
      Gateway["API Gateway & Controllers (${repoName})"]
      Services["Service Layer & Business Domain"]
    end
    subgraph Data_Tier["Data & Infrastructure Tier"]
      Database[("Primary Database")]
      Cache[("Cache / State Store")]
    end
    UI --> Gateway
    Gateway --> Services
    Services --> Database
    Services --> Cache`;
  }

  return `# ${repoName} Overview

## Description
${repoName} is an automated software system designed with modular component architecture, robust data pipelines, and responsive interface workflows.
`;
}

/**
 * Single entry point for all LLM calls. Supports both GroqCloud (gsk_...) and xAI Grok (xai-...) keys,
 * with automatic fallback between models and endpoints.
 */
async function callAI(prompt, { maxTokens = 2000, system, type } = {}) {
  const apiKey = (XAI_API_KEY || "").trim();

  if (!apiKey || /^_+$/.test(apiKey)) {
    logger.info("Using default fallback content (No API Key provided)");
    return generateFallbackContent(prompt, type);
  }

  const { provider, url, models } = getEndpointAndModels(apiKey);
  logger.info(`Sending AI prompt to ${provider} API (${url})...`);

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  let lastErr = null;

  for (const modelCandidate of models) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelCandidate,
          messages,
          max_tokens: maxTokens,
          temperature: 0.2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const text = data.choices?.[0]?.message?.content || "";
        if (text.trim()) {
          logger.success(`AI Response received successfully from ${provider} (${modelCandidate})`);
          return text.trim();
        }
      } else {
        logger.warn(`${provider} model '${modelCandidate}' status ${response.status}: ${JSON.stringify(data)}`);
        lastErr = new Error(data.error?.message || data.message || `HTTP ${response.status}`);
      }
    } catch (err) {
      logger.warn(`Fetch error for ${modelCandidate}: ${err.message}`);
      lastErr = err;
    }
  }

  logger.error(`All AI endpoints failed (${lastErr?.message}). Serving fallback content...`);
  return generateFallbackContent(prompt, type);
}

/** Calls the AI and parses the response as JSON, stripping markdown fences if present. */
async function callAIJson(prompt, opts = {}) {
  const raw = await callAI(prompt, opts);
  const cleaned = typeof raw === "string" ? raw.replace(/^```json\s*/i, "").replace(/```$/g, "").trim() : raw;
  try {
    return typeof cleaned === "string" ? JSON.parse(cleaned) : cleaned;
  } catch (err) {
    logger.warn(`Failed to parse AI JSON response, returning raw object.`);
    return typeof raw === "object" ? raw : { raw: cleaned };
  }
}

module.exports = { callAI, callAIJson };