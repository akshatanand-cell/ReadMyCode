# ReadMyCode — Custom Agents & Skills

This document describes the custom AI agents and skills built into ReadMyCode.

---

## Custom Agents

### 1. CodeAnalyzer Agent

**Location**: [`server/services/aiService.js`](server/services/aiService.js)

**Description**: The CodeAnalyzer Agent is the core AI engine of ReadMyCode. It receives parsed source code from a GitHub repository and generates structured documentation, diagrams, and analysis through the xAI Grok API.

**Capabilities**:
- Reads and understands codebases in 20+ programming languages (JavaScript, TypeScript, Python, Java, Go, Rust, etc.)
- Generates contextually accurate README documentation
- Produces structured API endpoint documentation with request/response schemas
- Creates Mermaid.js flowcharts showing control flow and data flow
- Generates system architecture diagrams
- Provides function-by-function explanations with complexity analysis
- Performs static code analysis for bug detection

**Architecture**:
```
┌─────────────────────────────────────────────┐
│             CodeAnalyzer Agent              │
├─────────────────────────────────────────────┤
│  Input: Parsed file tree + source code      │
│                                             │
│  ┌──────────────┐   ┌──────────────────┐   │
│  │ Prompt Engine │──▶│ xAI Grok API     │   │
│  │ (type-aware)  │   │ (grok-2-latest)  │   │
│  └──────────────┘   └────────┬─────────┘   │
│                              │              │
│                    ┌─────────▼─────────┐    │
│                    │ Response Parser   │    │
│                    │ (JSON / Markdown  │    │
│                    │  / Mermaid)       │    │
│                    └─────────┬─────────┘    │
│                              │              │
│                    ┌─────────▼─────────┐    │
│                    │ Fallback Engine   │    │
│                    │ (on API failure)  │    │
│                    └──────────────────-┘    │
│                                             │
│  Output: Typed content matching request     │
└─────────────────────────────────────────────┘
```

**Key Methods**:
| Method | Input | Output |
|--------|-------|--------|
| `generateContent(codeContext, type)` | Source code + type tag | Typed content (MD/JSON/Mermaid) |
| `generateFallbackContent(type, repoName)` | Type + repo name | Guaranteed valid fallback content |
| `callGrokAPI(prompt, systemPrompt)` | Prompt strings | Raw AI response text |

**Fallback Strategy**:
The agent implements a 3-tier reliability system:
1. **Primary**: Call xAI Grok API with type-specific prompt
2. **Parse & Validate**: Validate response matches expected format (JSON, Markdown, or Mermaid)
3. **Fallback**: On any failure, generate valid placeholder content matching the type contract

---

### 2. RepoCloner Agent

**Location**: [`server/services/githubService.js`](server/services/githubService.js)

**Description**: The RepoCloner Agent handles fetching repository source code from GitHub with a 3-tier fallback strategy that guarantees success.

**Fallback Tiers**:
1. **Tier 1 — Git Clone**: Uses `simple-git` to perform `git clone --depth 1` (fast shallow clone)
2. **Tier 2 — ZIP Download**: Downloads ZIP archive from `codeload.github.com` (tries `main` then `master` branches)
3. **Tier 3 — Mock Structure**: Creates a minimal repo structure with `package.json`, `index.js`, and `README.md`

**Key Feature**: Works in both local and serverless (Vercel) environments by using `os.tmpdir()` for all file operations.

---

## Custom Skills

### 1. MermaidDiagramSkill

**Location**: [`client/src/components/FlowchartViewer/MermaidDiagram.jsx`](client/src/components/FlowchartViewer/MermaidDiagram.jsx)

**Description**: A dual-mode diagram rendering skill that converts AI-generated Mermaid syntax into interactive, visual diagrams with automatic fallback.

**How It Works**:
```
┌─────────────────────────────────────────┐
│         MermaidDiagramSkill             │
├─────────────────────────────────────────┤
│                                         │
│  Input: Mermaid syntax string           │
│           │                             │
│           ▼                             │
│  ┌─────────────────┐                   │
│  │ Mermaid.js v10.9 │                   │
│  │ (Primary Render) │                   │
│  └────────┬────────┘                   │
│           │                             │
│     Success? ──Yes──▶ Render SVG        │
│           │                             │
│          No                             │
│           │                             │
│  ┌────────▼────────────────┐           │
│  │ Interactive SVG Fallback │           │
│  │ • Parse nodes from text  │           │
│  │ • Auto-layout grid       │           │
│  │ • Animated connections   │           │
│  │ • Pan & zoom support     │           │
│  └─────────────────────────┘           │
│                                         │
│  Output: Always renders a visual diagram│
└─────────────────────────────────────────┘
```

**Features**:
- **Mermaid.js rendering** with `suppressErrorRendering: true`
- **Interactive SVG fallback** with animated nodes, gradient connections, and hover effects
- **DOM Shield**: CSS rule that hides Mermaid error elements (`#d[id^="d"]`) injected into `document.body`
- **Pan & zoom** on the fallback SVG canvas

---

### 2. FileTreeParserSkill

**Location**: [`server/utils/fileWalker.js`](server/utils/fileWalker.js)

**Description**: Recursively walks a cloned repository directory and builds a structured file tree JSON representation. Used to display the repo structure in the UI and to select files for AI analysis.

**Features**:
- Ignores `node_modules`, `.git`, `dist`, `build`, and other non-essential directories
- Computes file sizes and categorizes by extension
- Builds a nested tree structure with `{name, path, type, size, children}`
- Handles symlinks and permission errors gracefully

---

### 3. CodeParserSkill

**Location**: [`server/services/codeParserService.js`](server/services/codeParserService.js)

**Description**: Extracts functions, classes, and exports from JavaScript/TypeScript source files using Babel AST parsing. Provides structured metadata for the Function Explainer feature.

**Capabilities**:
- Parses ES6+ syntax including arrow functions, async/await, decorators
- Extracts function signatures, parameter lists, and JSDoc comments
- Identifies exported vs. internal functions
- Handles both CommonJS and ES Module patterns
