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

function generateFallbackContent(prompt, type) {
  const lower = (prompt || "").toLowerCase();

  if (type === "readme" || lower.includes("readme")) {
    return `# RetailPulse Overview

## Description
RetailPulse is a high-performance retail analytics and inventory management system designed for real-time sales tracking, stock management, and predictive supply chain insights.

## Key Features
- **Real-Time Sales Dashboard**: Live transaction monitoring and revenue analytics.
- **Inventory Tracking**: Automated stock alerts, low-stock warnings, and reorder triggers.
- **Customer Analytics**: Purchase history analysis and customer segmentation.
- **RESTful API Service**: Scalable backend API endpoints for seamless integration.

## Installation & Setup
\`\`\`bash
# Clone repository
git clone https://github.com/akshatanand-cell/RetailPulse.git

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Architecture & Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB / Mongoose
- **Analytics Engine**: Grok & Llama AI Integration
`;
  }

  if (type === "functionExplain" || lower.includes("function") || lower.includes("explain")) {
    return JSON.stringify([
      {
        name: "processChatMessage",
        file: "controllers/chatController.js",
        purpose: "Processes user prompt, manages conversation history, and invokes AI response engine.",
        parameters: [
          { name: "message", type: "String", description: "User input prompt" },
          { name: "sessionId", type: "String", description: "Chat session identifier" }
        ],
        returns: "{ response: String, timestamp: Date }",
        complexity: "O(N)",
        example: "processChatMessage('Hello AI', 'sess_102');"
      },
      {
        name: "calculateDailySales",
        file: "services/salesService.js",
        purpose: "Calculates total sales revenue and transaction count for a given calendar day.",
        parameters: [
          { name: "date", type: "Date", description: "Target calculation date" },
          { name: "storeId", type: "String", description: "Unique store identifier" }
        ],
        returns: "{ totalRevenue: Number, orderCount: Number }",
        complexity: "O(N)",
        example: "calculateDailySales(new Date(), 'store_001');"
      }
    ]);
  }

  if (type === "apiDocs" || lower.includes("endpoint") || lower.includes("route") || lower.includes("api")) {
    return JSON.stringify({
      endpoints: [
        {
          method: "GET",
          path: "/api/sales/summary",
          description: "Fetches aggregated daily and monthly sales metrics.",
          authentication: "Bearer Token",
          queryParams: [
            { name: "period", type: "string", required: false, description: "daily | weekly | monthly" }
          ],
          responseSchema: {
            success: true,
            totalSales: 15420.50,
            totalOrders: 320
          }
        },
        {
          method: "POST",
          path: "/api/inventory/update",
          description: "Updates inventory quantities for specified store SKUs.",
          authentication: "Bearer Token",
          requestBody: {
            sku: "SKU-9921",
            quantity: 50
          },
          responseSchema: {
            success: true,
            message: "Inventory updated successfully"
          }
        }
      ]
    });
  }

  if (type === "flowchart" || lower.includes("flowchart")) {
    return `flowchart TD
    A["User Request & Interface"] --> B["API Gateway & Server Router"]
    B --> C["Authentication & JWT Security"]
    C --> D["Repository Parser & Code Analysis"]
    D --> E["Database & In-Memory Store"]
    E --> F["AI Analytics Engine"]
    F --> G["Interactive Client Dashboard"]`;
  }

  if (type === "architecture" || lower.includes("architecture")) {
    return `flowchart LR
    A["React Frontend UI"] --> B["Node.js Express API"]
    B --> C["JWT Auth Middleware"]
    C --> D["Grok & Llama AI Service"]
    D --> E["Database Storage"]`;
  }

  return `# RetailPulse Overview

## Description
RetailPulse is a high-performance retail analytics and inventory management system designed for real-time sales tracking, stock management, and predictive supply chain insights.

## Key Features
- **Real-Time Sales Dashboard**: Live transaction monitoring and revenue analytics.
- **Inventory Tracking**: Automated stock alerts, low-stock warnings, and reorder triggers.
- **Customer Analytics**: Purchase history analysis and customer segmentation.
- **RESTful API Service**: Scalable backend API endpoints for seamless integration.

## Installation & Setup
\`\`\`bash
# Clone repository
git clone https://github.com/akshatanand-cell/RetailPulse.git

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Architecture & Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB / Mongoose
- **Analytics Engine**: Grok & Llama AI Integration
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