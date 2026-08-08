const { XAI_API_KEY, AI_MODEL } = require("../config/env");
const logger = require("../utils/logger");

const XAI_BASE_URL = "https://api.x.ai/v1/chat/completions";

/**
 * Single entry point for all LLM calls. Every AI-powered feature
 * (readme, docs, flowchart, function explain, debugger) goes through here
 * using the xAI Grok API (OpenAI-compatible endpoints).
 */
async function callAI(prompt, { maxTokens = 2000, system } = {}) {
  try {
    if (!XAI_API_KEY || XAI_API_KEY.trim() === "" || /^_+$/.test(XAI_API_KEY)) {
      throw new Error("XAI_API_KEY is missing or invalid in environment settings");
    }

    const messages = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    messages.push({ role: "user", content: prompt });

    const body = {
      model: AI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2,
    };

    const response = await fetch(XAI_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY.trim()}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error(`Grok API error response body: ${JSON.stringify(data)}`);
      throw new Error(data.error?.message || data.message || `xAI Grok API returned ${response.status}`);
    }

    const text = data.choices?.[0]?.message?.content || "";
    return text.trim();
  } catch (err) {
    logger.error(`AI call failed: ${err.message}`);
    throw new Error(`AI generation failed: ${err.message}`);
  }
}

/** Calls the AI and parses the response as JSON, stripping markdown fences if present. */
async function callAIJson(prompt, opts = {}) {
  const raw = await callAI(prompt, opts);
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    logger.warn(`Failed to parse AI JSON response, returning raw text. Error: ${err.message}`);
    return { raw: cleaned };
  }
}

module.exports = { callAI, callAIJson };