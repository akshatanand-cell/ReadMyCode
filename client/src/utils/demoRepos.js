/**
 * Pre-analyzed sample demo repositories for instant unauthenticated exploration
 * Allows visitors to test visual dependency graphs, AST specs, and documentation with 0 setup.
 */

export const DEMO_REPOSITORIES = {
  'demo-react-app': {
    _id: 'demo-react-app',
    id: 'demo-react-app',
    repoName: 'shopstream-web',
    name: 'shopstream-web',
    owner: 'demo_guest',
    repoUrl: 'https://github.com/readmycode-demo/shopstream-web',
    githubUrl: 'https://github.com/readmycode-demo/shopstream-web',
    status: 'ready',
    projectType: 'javascript',
    entryPoint: 'src/main.jsx',
    defaultBranch: 'main',
    stars: 1240,
    isDemo: true,
    fileTree: [
      { path: 'src', type: 'tree' },
      { path: 'src/main.jsx', type: 'blob', size: 1024 },
      { path: 'src/App.jsx', type: 'blob', size: 2048 },
      { path: 'src/components/Header.jsx', type: 'blob', size: 1536 },
      { path: 'src/components/ProductGrid.jsx', type: 'blob', size: 3072 },
      { path: 'src/context/CartContext.jsx', type: 'blob', size: 2560 },
      { path: 'src/hooks/useProducts.js', type: 'blob', size: 1800 },
      { path: 'src/services/api.js', type: 'blob', size: 1200 },
      { path: 'package.json', type: 'blob', size: 850 },
      { path: 'vite.config.js', type: 'blob', size: 450 },
    ],
    files: [
      {
        path: 'src/main.jsx',
        extension: '.jsx',
        size: 1024,
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
      },
      {
        path: 'package.json',
        extension: '.json',
        size: 850,
        content: `{\n  "name": "shopstream-web",\n  "version": "2.4.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "zustand": "^4.5.2",\n    "tailwindcss": "^3.4.1"\n  }\n}`,
      },
    ],
    specDocs: {
      readme: `# ShopStream Web — Modern Headless E-Commerce Client\n\n> High-performance storefront client built with **React 18**, **Vite**, **Tailwind CSS**, and **Zustand** state management.\n\n---\n\n## 📌 Overview\nShopStream Web provides a responsive user experience with optimistic cart updates, dynamic product catalog virtualization, and real-time inventory hydration.\n\n### Key Features\n- ⚡ **Sub-second LCP**: Ultra-fast initial paint with Vite and asset preloading.\n- 🛒 **Global Cart Store**: Optimistic UI updates powered by Zustand.\n- 🔍 **Faceted Search**: Instant client-side fuzzy search with debounced filters.\n- 📱 **Mobile-First Layout**: Fully responsive fluid grid supporting dark mode.\n\n---\n\n## 🚀 Getting Started\n\n\`\`\`bash\n# 1. Clone repository\ngit clone https://github.com/readmycode-demo/shopstream-web.git\ncd shopstream-web\n\n# 2. Install dependencies\nnpm install\n\n# 3. Start local development server\nnpm run dev\n\`\`\`\n\n---\n\n## 📂 Architecture Map\nComponent rendering is modularized into isolated presentation, store, and network layers.`,
      architecture: `flowchart TD
  subgraph Presentation["User Interface Layer"]
    App["App.jsx (Root Layout)"]
    Header["Header.jsx (Navigation & Search)"]
    Grid["ProductGrid.jsx (Catalog Virtualizer)"]
    Modal["CartDrawer.jsx (Slide-over Cart)"]
  end

  subgraph StateLayer["Reactive State Management"]
    CartStore[("CartContext / Zustand Store")]
    AuthStore[("User Session Store")]
  end

  subgraph NetworkLayer["Data Fetching & Gateway"]
    ApiGateway["api.js (Axios HTTP Client)"]
    ProductsHook["useProducts.js (SWR Data Hook)"]
  end

  App --> Header
  App --> Grid
  Header --> CartStore
  Grid --> ProductsHook
  Grid --> Modal
  Modal --> CartStore
  ProductsHook --> ApiGateway`,
      agents: `# ShopStream Web — Agent Rules & Mission Constitution\n\n## Purpose\nStrict behavioral guidelines for autonomous AI agents collaborating on the ShopStream frontend.\n\n### 1. Code Standards\n- All components MUST use functional React with explicit TypeScript or ES Module imports.\n- State management mutations MUST remain idempotent.\n- Avoid prop drilling deeper than 2 layers; leverage \`CartContext\`.\n\n### 2. Styling Rules\n- Use Tailwind CSS classes exclusively. No ad-hoc inline styles.\n- All interactive buttons must have visible keyboard focus rings (\`focus-visible:ring-2\`).`,
      taskBreakdown: `# ShopStream Web — Phased Implementation Roadmap\n\n## Phase 1: Core Storefront Foundation\n- [x] Set up Vite 5 + React 18 boilerplate\n- [x] Configure Tailwind CSS design tokens\n- [x] Implement responsive Navbar & Hero banner\n\n## Phase 2: Catalog & State Management\n- [x] Build ProductGrid with image lazy-loading\n- [x] Wire up Zustand cart store with localStorage persistence\n- [ ] Implement multi-currency price formatting\n\n## Phase 3: Checkout & Order Tracking\n- [ ] Integrate Stripe Elements checkout workflow\n- [ ] Real-time webhook subscription for order status updates`,
      flowchart: `flowchart LR
  Visit["1. Visitor Lands"] --> Fetch["2. Fetch Products API"]
  Fetch --> Render["3. Render Virtualized Grid"]
  Render --> Action{"4. User Action"}
  Action -->|Add to Cart| UpdateStore["5. Optimistic Store Update"]
  Action -->|Search| Filter["6. Debounced Filter Pipeline"]
  UpdateStore --> Persist["7. Save to localStorage"]
  Filter --> Render`,
    },
  },

  'demo-python-api': {
    _id: 'demo-python-api',
    id: 'demo-python-api',
    repoName: 'neural-rag-service',
    name: 'neural-rag-service',
    owner: 'demo_guest',
    repoUrl: 'https://github.com/readmycode-demo/neural-rag-service',
    githubUrl: 'https://github.com/readmycode-demo/neural-rag-service',
    status: 'ready',
    projectType: 'python',
    entryPoint: 'app.py',
    defaultBranch: 'main',
    stars: 890,
    isDemo: true,
    fileTree: [
      { path: 'app.py', type: 'blob', size: 2500 },
      { path: 'core/rag_engine.py', type: 'blob', size: 4200 },
      { path: 'core/embeddings.py', type: 'blob', size: 1800 },
      { path: 'api/routes.py', type: 'blob', size: 3100 },
      { path: 'config.py', type: 'blob', size: 900 },
      { path: 'requirements.txt', type: 'blob', size: 650 },
    ],
    files: [
      {
        path: 'app.py',
        extension: '.py',
        size: 2500,
        content: `from fastapi import FastAPI\nfrom api.routes import router\n\napp = FastAPI(title="Neural RAG Service", version="1.0.0")\napp.include_router(router, prefix="/api/v1")\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)`,
      },
    ],
    specDocs: {
      readme: `# Neural RAG Service — Scalable Retrieval-Augmented Generation API\n\n> High-throughput enterprise RAG microservice built with **FastAPI**, **LangChain**, and **Qdrant Vector Database**.\n\n---\n\n## 📌 Overview\nNeural RAG Service exposes low-latency endpoints for semantic document ingestion, dense vector embedding calculation, and context-augmented answer generation.\n\n### Key Features\n- ⚡ **Asynchronous Streaming**: Chunked SSE token streaming for responsive chat.\n- 🧠 **Hybrid Search**: Dense semantic retrieval combined with BM25 keyword matching.\n- 🛡️ **Prompt Guardrails**: Automated PII masking and prompt injection detection.\n\n---\n\n## 🚀 Quickstart\n\n\`\`\`bash\n# Install dependencies\npip install -r requirements.txt\n\n# Run FastAPI server with Uvicorn\nuvicorn app:app --host 0.0.0.0 --port 8000 --reload\n\`\`\``,
      architecture: `flowchart LR
  Client["Client Request"] --> Gateway["FastAPI Gateway (/api/v1)"]
  Gateway --> Guardrails["Input Validation & PII Filter"]
  Guardrails --> Embeddings["Embedding Pipeline (BGE-Large)"]
  Embeddings --> VectorDB[("Qdrant Vector Store")]
  VectorDB --> ContextBuilder["Top-K Context Formatter"]
  ContextBuilder --> LLM["Grok / Llama 3 Inference"]
  LLM --> Stream["Streaming SSE Response"]`,
      agents: `# Neural RAG Service — Agent Rules\n\n## Standards\n- All endpoints MUST declare Pydantic request & response schemas.\n- Asynchronous database queries MUST utilize \`async with\` connection contexts.\n- Never log raw user prompt contents in production to comply with GDPR.`,
      taskBreakdown: `# Neural RAG Service — Implementation Roadmap\n\n## Phase 1: Ingestion & Embeddings\n- [x] Document chunking & token counting\n- [x] Batch vector embedding generation\n\n## Phase 2: Retrieval & Hybrid Ranking\n- [x] Qdrant collection indexing with cosine distance\n- [ ] Cross-encoder re-ranking implementation`,
      flowchart: `flowchart TD
  Query["1. User Query"] --> Ingest["2. Parse & Tokenize"]
  Ingest --> VectorSearch["3. Semantic Vector Search"]
  VectorSearch --> Rerank["4. Cross-Encoder Re-Ranking"]
  Rerank --> PromptSynth["5. Prompt Synthesis"]
  PromptSynth --> Stream["6. Stream Tokens to Client"]`,
    },
  },
};

export function getDemoRepo(id) {
  if (!id) return null;
  return DEMO_REPOSITORIES[id] || null;
}
