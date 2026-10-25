# ReadMyCode — Agent Rules & Constitution

## Purpose

This document defines the rules, constraints, and behavioral guidelines for all AI agents operating within the ReadMyCode codebase. These rules apply to code generation agents, review agents, and the core AI analysis engine.

---

## 1. Code Generation Rules

### 1.1 Language & Style
- All server-side code MUST be written in **CommonJS** (`require`/`module.exports`).
- All client-side code MUST use **ES Modules** (`import`/`export`).
- Use `const` by default; use `let` only when reassignment is necessary. Never use `var`.
- All async operations MUST use `async/await`. Avoid raw `.then()` chains.
- Functions MUST have clear, descriptive names. No single-letter variables except loop counters.

### 1.2 Error Handling
- Every `async` controller MUST have a `try/catch` block.
- Errors MUST return structured JSON: `{ message: "..." }` with appropriate HTTP status codes.
- Never expose stack traces or internal paths to the client in production.
- AI service failures MUST fall back to `generateFallbackContent()` — never return empty results.

### 1.3 Security
- Never commit API keys, tokens, or secrets to the repository.
- All user passwords MUST be hashed with bcrypt (minimum 10 salt rounds).
- JWT tokens MUST have an expiration (`7d` default).
- User input MUST be validated before processing (URL format, file type, size limits).
- File operations MUST use `os.tmpdir()` in serverless environments — never write to the application directory.

---

## 2. AI Analysis Agent Rules

### 2.1 Prompt Engineering
- Prompts MUST include the `type` parameter to specify expected output format.
- Each feature type has a strict output contract:
  - `type: "readme"` → Markdown string
  - `type: "apiDocs"` → JSON array of endpoint objects
  - `type: "flowchart"` → Mermaid.js diagram string (starting with `graph` or `flowchart`)
  - `type: "architecture"` → Mermaid.js diagram string
  - `type: "functionExplain"` → JSON array of function explanation objects
  - `type: "debug"` → JSON array of issue objects

### 2.2 Fallback Behavior
- If the AI API returns an error, timeout, or malformed response, the agent MUST generate fallback content matching the expected type contract.
- Fallback content MUST be functional and renderable — never return raw error messages to the UI.
- The Mermaid diagram renderer MUST have a secondary SVG-based interactive renderer for cases where Mermaid.js parsing fails.

### 2.3 Rate Limiting & Resource Management
- AI API calls MUST respect rate limits. Implement retry with exponential backoff.
- Repository cloning MUST use the 3-tier fallback: `git clone` → ZIP download → mock structure.
- Temporary files MUST be cleaned up after analysis completes.

---

## 3. Review & Quality Rules

### 3.1 Code Review
- All generated code MUST pass ESLint without errors before committing.
- Components MUST be focused and reusable — no god components.
- API responses MUST follow consistent JSON structure: `{ data, message, error }`.

### 3.2 Testing
- Critical user flows MUST have Playwright end-to-end tests.
- Tests MUST run in CI and produce uploadable HTML reports.

### 3.3 Documentation
- Every new feature MUST update the relevant documentation (README, ARCHITECTURE, or API docs).
- Commit messages MUST be descriptive and follow conventional format: `type: description`.

---

## 4. Deployment Rules

- The `main` branch MUST always be deployable.
- Vercel deployments auto-trigger on push to `main`.
- Environment variables MUST be set in Vercel project settings for production.
- The build command MUST install both server and client dependencies.
- Serverless functions MUST complete within 30 seconds.

---

## 5. Agent Interaction Protocol

- Agents MUST NOT modify files outside the project workspace.
- Agents MUST preserve existing comments and documentation unless explicitly asked to remove them.
- When multiple solutions exist, agents SHOULD present options and let the user decide.
- Agents MUST commit changes progressively — never dump all changes in a single commit.
