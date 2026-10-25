import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import {
  ArrowRight,
  Sparkles,
  Check,
  X,
  FileText,
  Shield,
  Layers,
  Code2,
  Terminal,
  Zap,
  ExternalLink,
  Github,
  CheckCircle2,
  Lock,
} from 'lucide-react';

// Example repos for instant one-click testing
const EXAMPLE_REPOS = [
  { name: 'expressjs/express', label: 'Express.js', url: 'https://github.com/expressjs/express' },
  { name: 'fastapi/fastapi', label: 'FastAPI', url: 'https://github.com/fastapi/fastapi' },
  { name: 'facebook/react', label: 'React', url: 'https://github.com/facebook/react' },
];

// Sample real project demonstration data
const DEMO_TABS = [
  { id: 'readme', label: 'README.md' },
  { id: 'architecture', label: 'ARCHITECTURE.md' },
  { id: 'agents', label: 'AGENTS.md' },
  { id: 'tasks', label: 'TASK_BREAKDOWN.md' },
  { id: 'flowchart', label: 'Logic Flowchart' },
  { id: 'functions', label: 'Function Index' },
];

const SAMPLE_PROJECT = {
  name: 'MarketPulse-AI',
  owner: 'portfolio-analytics',
  branch: 'main',
  runtime: 'Python 3.11 / Streamlit',
  filesAnalyzed: 14,
  functionsCount: 22,
};

const SAMPLE_GALLERY = [
  {
    name: 'Express.js',
    repo: 'expressjs/express',
    runtime: 'Node.js / CommonJS',
    description: 'Fast, unopinionated, minimalist web framework for Node.js.',
    badge: 'REST API',
    url: 'https://github.com/expressjs/express',
  },
  {
    name: 'FastAPI',
    repo: 'fastapi/fastapi',
    runtime: 'Python 3.10+ / ASGI',
    description: 'High performance, easy to learn, fast to code, production-ready API framework.',
    badge: 'Microservices',
    url: 'https://github.com/fastapi/fastapi',
  },
  {
    name: 'ReadMyCode',
    repo: 'akshatanand-cell/ReadMyCode',
    runtime: 'Node.js & React 18',
    description: 'Automated codebase intelligence, AST parsing, and documentation engine.',
    badge: 'Full Stack',
    url: 'https://github.com/akshatanand-cell/ReadMyCode',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('readme');
  const [repoInput, setRepoInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [comparisonMode, setComparisonMode] = useState('after'); // 'before' | 'after'

  const handleStartAnalysis = (e) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      setInputError('Please enter a valid GitHub repository URL.');
      return;
    }
    if (!repoInput.includes('github.com')) {
      setInputError('URL must point to a valid GitHub repository (e.g., https://github.com/owner/repo).');
      return;
    }
    setInputError('');
    navigate(`/analyze?url=${encodeURIComponent(repoInput.trim())}`);
  };

  const handleLoadSample = (sampleUrl) => {
    setRepoInput(sampleUrl);
    setInputError('');
    navigate(`/analyze?url=${encodeURIComponent(sampleUrl)}`);
  };

  return (
    <div className="bg-background text-text-primary min-h-screen">
      {/* 1. Hero Section */}
      <section className="pt-20 pb-12 sm:pt-28 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Codebase Intelligence</span>
          </div>

          {/* Outcome Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.08] mb-6">
            Your repo, fully documented
            <br />
            <span className="text-emerald-400">in 30 seconds.</span>
          </h1>

          {/* Benefit Subline */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            Paste a GitHub URL. Get a clean, production-ready README, architecture diagrams, API specs, and setup instructions automatically.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[44px] text-base px-6 font-semibold shadow-lg shadow-emerald-500/10"
              onClick={() => {
                const inputEl = document.getElementById('hero-repo-input');
                if (inputEl) inputEl.focus();
                else navigate('/analyze');
              }}
            >
              Generate docs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-h-[44px] text-base px-6 font-medium"
              onClick={() => {
                const element = document.getElementById('before-after-preview');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See example
            </Button>
          </div>

          {/* Core Input Box directly in Hero */}
          <form
            onSubmit={handleStartAnalysis}
            className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-2 sm:p-2.5 shadow-xl text-left transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label htmlFor="hero-repo-input" className="sr-only">
                GitHub Repository URL
              </label>
              <div className="relative flex-1 w-full">
                <input
                  id="hero-repo-input"
                  type="text"
                  value={repoInput}
                  onChange={(e) => {
                    setRepoInput(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  placeholder="https://github.com/owner/repository"
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500 font-mono min-h-[44px]"
                  aria-label="GitHub Repository URL"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <Button
                type="submit"
                size="md"
                className="w-full sm:w-auto shrink-0 min-h-[44px] px-5 font-semibold bg-emerald-500 hover:bg-emerald-600 text-black border-none"
              >
                Generate Docs
              </Button>
            </div>

            {inputError && (
              <p className="text-red-400 text-xs mt-2 px-2 font-medium flex items-center gap-1.5" role="alert">
                <X className="w-3.5 h-3.5" />
                {inputError}
              </p>
            )}

            {/* Example Chips */}
            <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <span className="text-[12px] text-text-muted font-medium">Try with an example:</span>
              <div className="flex flex-wrap items-center gap-2">
                {EXAMPLE_REPOS.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => handleLoadSample(ex.url)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background-secondary hover:bg-zinc-800 text-text-secondary hover:text-emerald-400 border border-border text-[11px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`Test with ${ex.label} repository`}
                  >
                    <span>{ex.label}</span>
                  </button>
                ))}
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => navigate('/analyze')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline focus-visible:outline-none"
                >
                  Upload ZIP
                </button>
              </div>
            </div>
          </form>

          {/* Privacy Trust Callout */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>We delete cloned source code immediately after analysis. Generated docs and diagrams are saved to your account.</span>
          </div>
        </div>
      </section>

      {/* 2. Before / After Comparison Preview */}
      <section id="before-after-preview" className="py-12 bg-background-secondary/60 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                Real Transformation
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                What ReadMyCode generates for your repo
              </h2>
            </div>

            {/* Before vs After Switcher */}
            <div className="flex items-center bg-card border border-border rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setComparisonMode('before')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  comparisonMode === 'before'
                    ? 'bg-zinc-800 text-zinc-300 shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Typical Repo (Before)
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode('after')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  comparisonMode === 'after'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                ReadMyCode (After)
              </button>
            </div>
          </div>

          {/* Side-by-Side or Selected State Card */}
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Top Chrome Bar */}
            <div className="bg-background-secondary border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="font-mono text-text-primary font-medium">
                  {comparisonMode === 'before' ? 'typical-repo / README.md' : 'marketpulse-analytics / README.md'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {comparisonMode === 'before' ? (
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-mono">
                    Sparse • Missing Context
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                    ✓ Production-Grade • Generated in 18s
                  </span>
                )}
              </div>
            </div>

            {/* Content Display */}
            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm min-h-[340px]">
              {comparisonMode === 'before' ? (
                <div className="space-y-4 max-w-2xl text-text-muted">
                  <p className="text-zinc-500 italic"># my-project</p>
                  <p className="text-zinc-400">TODO: write documentation.</p>
                  <pre className="p-3 bg-background-secondary border border-border rounded-lg text-zinc-500">
                    npm install{'\n'}npm start
                  </pre>
                  <p className="text-zinc-500 text-xs">
                    (No architecture diagram, no API docs, no environment variables list, no contributor guide.)
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl font-sans text-xs sm:text-sm">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[11px]">
                      Python 3.11
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[11px]">
                      License: MIT
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono text-[11px]">
                      AST Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">
                      MarketPulse AI &bull; Quantitative Portfolio Engine
                    </h3>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                      High-throughput quantitative analytics pipeline calculating Sharpe optimization, Monte Carlo path projections, and rolling volatility series across equity indices.
                    </p>
                  </div>

                  {/* Architecture quick card */}
                  <div className="p-4 bg-background-secondary border border-border rounded-xl space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                      Architectural Layers
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <div className="p-2 bg-card rounded border border-border">
                        <span className="text-text-muted">Frontend:</span> Streamlit UI
                      </div>
                      <div className="p-2 bg-card rounded border border-border">
                        <span className="text-text-muted">Services:</span> NumPy / SciPy
                      </div>
                      <div className="p-2 bg-card rounded border border-border">
                        <span className="text-text-muted">Ingress:</span> REST API
                      </div>
                    </div>
                  </div>

                  {/* Quickstart instructions */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary font-mono mb-2">
                      Installation & Setup
                    </h4>
                    <pre className="p-3 bg-background-secondary border border-border rounded-xl font-mono text-xs overflow-x-auto text-emerald-300">
                      git clone https://github.com/portfolio-analytics/MarketPulse-AI.git{'\n'}
                      pip install -r requirements.txt{'\n'}
                      streamlit run app.py
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Full Workspace Preview */}
      <section id="product-demo" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
                Full Workspace Inspection
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Every file generated from your code
              </h2>
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              Click tabs below to inspect the complete set of specifications created for {SAMPLE_PROJECT.name}.
            </p>
          </div>

          {/* Workbench Frame */}
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Top Chrome Bar */}
            <div className="bg-background-secondary border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-text-primary font-medium">
                  {SAMPLE_PROJECT.owner} / {SAMPLE_PROJECT.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-card border border-border text-text-secondary font-mono">
                  {SAMPLE_PROJECT.branch}
                </span>
              </div>

              <div className="flex items-center gap-3 text-text-secondary text-[11px]">
                <span>{SAMPLE_PROJECT.runtime}</span>
                <span className="text-border">|</span>
                <span>{SAMPLE_PROJECT.filesAnalyzed} files parsed</span>
                <span className="text-border">|</span>
                <span>{SAMPLE_PROJECT.functionsCount} functions indexed</span>
              </div>
            </div>

            {/* Document Navigation Tabs */}
            <div className="bg-card border-b border-border px-4 flex items-center gap-1 overflow-x-auto scrollbar-thin">
              {DEMO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 font-semibold'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                  aria-label={`View ${tab.label}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Display */}
            <div className="p-6 sm:p-8 min-h-[380px] bg-card text-xs sm:text-sm font-sans leading-relaxed">
              {activeTab === 'readme' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-xl font-bold text-text-primary tracking-tight">
                      MarketPulse AI: Quantitative Portfolio Analytics
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Automated documentation generated from repository AST extraction.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      Architecture Overview
                    </h4>
                    <p className="text-text-secondary leading-relaxed">
                      MarketPulse AI evaluates multi-asset equity portfolios using Geometric Brownian Motion simulations and Sharpe optimization. The codebase is organized into domain models, data sanitizers, and numerical services.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      Quickstart
                    </h4>
                    <pre className="bg-background-secondary border border-border rounded-xl p-3 font-mono text-xs overflow-x-auto text-emerald-300">
                      pip install -r requirements.txt{'\n'}
                      streamlit run app.py
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-text-primary">
                      System Topology and Data Flow (ARCHITECTURE.md)
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Extracted component boundaries and cross-module call relationships.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase">Presentation Layer</span>
                      <h4 className="font-semibold text-text-primary text-xs mt-1">app.py</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Streamlit multi-tab user interface with Plotly charting controls.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase">Services Layer</span>
                      <h4 className="font-semibold text-text-primary text-xs mt-1">services/analytics.py</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Numerical indicators: 20/50 SMA, 14-day RSI, and Monte Carlo paths.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase">Data & Domain</span>
                      <h4 className="font-semibold text-text-primary text-xs mt-1">models/portfolio.py</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Asset weights, expected returns, and covariance calculations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-text-primary">
                      Autonomous Agent Constitution (AGENTS.md)
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Operational rules and contracts for LLM agents operating in this repository.
                    </p>
                  </div>
                  <div className="bg-background-secondary border border-border rounded-xl p-4 font-mono text-xs space-y-3">
                    <div>
                      <span className="text-emerald-400 font-semibold">RULE 1: Type Annotations</span>
                      <p className="text-text-secondary text-[11px] mt-0.5 font-sans">
                        All numerical helper functions must declare strict NumPy and Pandas parameter typing.
                      </p>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">RULE 2: Zero Disk Leakage</span>
                      <p className="text-text-secondary text-[11px] mt-0.5 font-sans">
                        Analysis routines must execute using in-memory series. No temporary CSV files may be written to disk.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-text-primary">
                      Execution Roadmap (TASK_BREAKDOWN.md)
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Phased implementation plan with dependency sequencing.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-background-secondary border border-border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-text-primary font-medium">Phase 1: Market Data Ingestion</span>
                        <p className="text-[11px] text-text-secondary mt-0.5">Time-series validation, holiday filling, log return calculation.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-border font-medium text-emerald-400">
                        Completed
                      </span>
                    </div>
                    <div className="p-3 bg-background-secondary border border-border rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-text-primary font-medium">Phase 2: Quantitative Indicators</span>
                        <p className="text-[11px] text-text-secondary mt-0.5">Moving average crossovers, RSI bounds, drawdown tracking.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-border font-medium text-emerald-400">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'flowchart' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-text-primary">
                      Logic Pathway Visualization
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Visual diagram rendered from AST call-site mapping.
                    </p>
                  </div>
                  <div className="p-4 bg-background-secondary border border-border rounded-xl flex flex-col items-center justify-center py-6">
                    <div className="w-full max-w-md space-y-2.5 font-mono text-xs text-center">
                      <div className="p-2.5 bg-card border border-border rounded-lg font-semibold text-text-primary">
                        User inputs tickers & lookback window
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-border rounded-lg text-text-primary">
                        generate_synthetic_quotes() & clean_financial_series()
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-emerald-500/40 rounded-lg text-emerald-400 font-medium">
                        Plotly visual rendering in Streamlit container
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'functions' && (
                <div className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-text-primary">
                      Indexed Function Registry
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Parsed signatures, arguments, and return types extracted from source.
                    </p>
                  </div>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-background-secondary border-b border-border text-text-muted uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Function</th>
                          <th className="p-2.5">Module</th>
                          <th className="p-2.5">Inputs</th>
                          <th className="p-2.5">Return Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="p-2.5 font-semibold text-text-primary">calculate_moving_averages</td>
                          <td className="p-2.5 text-text-secondary">services/analytics.py</td>
                          <td className="p-2.5 text-text-secondary">series, short_win, long_win</td>
                          <td className="p-2.5 text-emerald-400">Tuple[Series, Series]</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-text-primary">compute_rsi</td>
                          <td className="p-2.5 text-text-secondary">services/analytics.py</td>
                          <td className="p-2.5 text-text-secondary">series, period=14</td>
                          <td className="p-2.5 text-emerald-400">pd.Series</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sample Output Gallery with Real Repositories */}
      <section className="py-16 bg-background-secondary/60 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              Verified Documentation Gallery
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Tested on production open-source codebases
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Explore how ReadMyCode synthesizes real-world repositories across different tech stacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_GALLERY.map((item) => (
              <div
                key={item.repo}
                className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">{item.runtime}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1.5">{item.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-muted">{item.repo}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoadSample(item.url)}
                    className="min-h-[36px] text-xs font-medium hover:text-emerald-400"
                  >
                    Analyze
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-4">
          Ready to document your repository?
        </h2>
        <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-8 font-normal">
          Free, no account required. Paste a GitHub repository link or upload a ZIP file to get started.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="w-full sm:w-auto min-h-[44px] px-8 font-semibold bg-emerald-500 hover:bg-emerald-600 text-black border-none"
            onClick={() => navigate('/analyze')}
          >
            Start Analysis Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto min-h-[44px] px-6 font-medium"
            onClick={() => navigate('/login')}
          >
            Sign in to Save History
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
