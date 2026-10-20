import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

// Sample real project demonstration data
const DEMO_TABS = [
  { id: 'readme', label: 'README.md' },
  { id: 'architecture', label: 'ARCHITECTURE.md' },
  { id: 'agents', label: 'AGENTS.md' },
  { id: 'tasks', label: 'TASK_BREAKDOWN.md' },
  { id: 'flowchart', label: 'Flowchart' },
  { id: 'functions', label: 'Functions' },
];

const SAMPLE_PROJECT = {
  name: 'MarketPulse-AI',
  owner: 'portfolio-analytics',
  branch: 'main',
  runtime: 'Python 3.11 / Streamlit',
  filesAnalyzed: 14,
  functionsCount: 22,
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('readme');
  const [repoInput, setRepoInput] = useState('');
  const [inputError, setInputError] = useState('');

  const handleStartAnalysis = (e) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      setInputError('Please enter a valid GitHub repository URL.');
      return;
    }
    if (!repoInput.includes('github.com')) {
      setInputError('URL must point to a valid GitHub repository.');
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
    <div className="bg-background text-text-primary">
      {/* 1. Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-text-secondary mb-4">
            Automated Codebase Intelligence
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary leading-[1.08] mb-6">
            Complete code documentation.
            <br />
            Generated in seconds.
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            ReadMyCode parses abstract syntax trees, directory structures, and call graphs. It produces production specifications, architecture diagrams, and function indices without manual writing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/analyze' : '/analyze')}
            >
              Analyze a Repository
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const element = document.getElementById('product-demo');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Inspect Sample Output
            </Button>
          </div>

          {/* Quick Repository Input Bar */}
          <form
            onSubmit={handleStartAnalysis}
            className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-2 sm:p-2.5 shadow-subtle text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => {
                    setRepoInput(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-background-secondary border border-border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                  aria-label="GitHub Repository URL"
                />
              </div>
              <Button type="submit" size="md" className="w-full sm:w-auto shrink-0">
                Generate Specs
              </Button>
            </div>
            {inputError && (
              <p className="text-error text-xs mt-2 px-1 font-medium">{inputError}</p>
            )}
            <div className="mt-2.5 pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <span className="text-[11px] text-text-muted">Or test with verified repositories:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample('https://github.com/expressjs/express')}
                  className="text-[11px] text-text-secondary hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  Express.js
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample('https://github.com/fastapi/fastapi')}
                  className="text-[11px] text-text-secondary hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  FastAPI
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => navigate('/analyze')}
                  className="text-[11px] text-text-secondary hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  Upload ZIP Archive
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Interactive Product Demonstration */}
      <section id="product-demo" className="py-12 bg-background-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                Live Output Preview
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
                The generated workspace
              </h2>
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              Simulated demonstration generated from source code in repository: {SAMPLE_PROJECT.name}.
            </p>
          </div>

          {/* Workbench Frame */}
          <div className="bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
            {/* Top Chrome Bar */}
            <div className="bg-background-secondary border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
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
                <span>{SAMPLE_PROJECT.filesAnalyzed} files indexed</span>
                <span className="text-border">|</span>
                <span>{SAMPLE_PROJECT.functionsCount} functions typed</span>
              </div>
            </div>

            {/* Document Navigation Tabs */}
            <div className="bg-card border-b border-border px-4 flex items-center gap-1 overflow-x-auto scrollbar-thin">
              {DEMO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none ${
                    activeTab === tab.id
                      ? 'border-primary text-text-primary font-semibold'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
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
                    <p className="text-text-secondary">
                      MarketPulse AI evaluates multi-asset equity portfolios using Geometric Brownian Motion simulations and Sharpe optimization. The codebase is organized into domain models, data sanitizers, and numerical services.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      Quickstart
                    </h4>
                    <pre className="bg-background-secondary border border-border rounded-lg p-3 font-mono text-xs overflow-x-auto">
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
                      System Topology and Data Flow
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Extracted component boundaries and cross-module call relationships.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-lg bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-text-muted uppercase">Presentation Layer</span>
                      <h4 className="font-semibold text-text-primary text-xs mt-1">app.py</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Streamlit multi-tab user interface with Plotly charting controls.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-text-muted uppercase">Services Layer</span>
                      <h4 className="font-semibold text-text-primary text-xs mt-1">services/analytics.py</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Numerical indicators: 20/50 SMA, 14-day RSI, and Monte Carlo paths.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-background-secondary border border-border">
                      <span className="text-[11px] font-mono text-text-muted uppercase">Data & Domain</span>
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
                  <div className="bg-background-secondary border border-border rounded-lg p-4 font-mono text-xs space-y-3">
                    <div>
                      <span className="text-primary font-semibold">RULE 1: Type Annotations</span>
                      <p className="text-text-secondary text-[11px] mt-0.5 font-sans">
                        All numerical helper functions must declare strict NumPy and Pandas parameter typing.
                      </p>
                    </div>
                    <div>
                      <span className="text-primary font-semibold">RULE 2: Zero Disk Leakage</span>
                      <p className="text-text-secondary text-[11px] mt-0.5 font-sans">
                        Analysis routines must execute using in-memory series. No temporary CSV files may be written to disk.
                      </p>
                    </div>
                    <div>
                      <span className="text-primary font-semibold">RULE 3: Fallback Integrity</span>
                      <p className="text-text-secondary text-[11px] mt-0.5 font-sans">
                        If market feeds fail, deterministic synthetic walk generators must activate seamlessly.
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
                    <div className="p-3 bg-background-secondary border border-border rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-text-primary font-medium">Phase 1: Market Data Ingestion</span>
                        <p className="text-[11px] text-text-secondary mt-0.5">Time-series validation, holiday filling, log return calculation.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-border font-medium text-success">
                        Completed
                      </span>
                    </div>
                    <div className="p-3 bg-background-secondary border border-border rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-text-primary font-medium">Phase 2: Quantitative Indicators</span>
                        <p className="text-[11px] text-text-secondary mt-0.5">Moving average crossovers, RSI bounds, drawdown tracking.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-border font-medium text-success">
                        Completed
                      </span>
                    </div>
                    <div className="p-3 bg-background-secondary border border-border rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-text-primary font-medium">Phase 3: Monte Carlo Simulation Engine</span>
                        <p className="text-[11px] text-text-secondary mt-0.5">GBM path projection over 252 trading sessions.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-card border border-border font-medium text-success">
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
                  <div className="p-4 bg-background-secondary border border-border rounded-lg flex flex-col items-center justify-center py-8">
                    <div className="w-full max-w-md space-y-3 font-mono text-xs text-center">
                      <div className="p-2.5 bg-card border border-border rounded-lg font-semibold text-text-primary">
                        User inputs tickers & lookback window
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-border rounded-lg text-text-primary">
                        generate_synthetic_quotes() & clean_financial_series()
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-border rounded-lg text-text-primary">
                        calculate_moving_averages() & compute_rsi()
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-border rounded-lg text-text-primary">
                        monte_carlo_simulation(initial_price, mu, sigma)
                      </div>
                      <div className="text-text-muted text-sm">&darr;</div>
                      <div className="p-2.5 bg-card border border-primary/40 rounded-lg text-primary font-medium">
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
                  <div className="overflow-x-auto border border-border rounded-lg">
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
                          <td className="p-2.5 text-primary">Tuple[Series, Series]</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-text-primary">compute_rsi</td>
                          <td className="p-2.5 text-text-secondary">services/analytics.py</td>
                          <td className="p-2.5 text-text-secondary">series, period=14</td>
                          <td className="p-2.5 text-primary">pd.Series</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-text-primary">monte_carlo_simulation</td>
                          <td className="p-2.5 text-text-secondary">services/analytics.py</td>
                          <td className="p-2.5 text-text-secondary">p0, mu, sigma, days, n</td>
                          <td className="p-2.5 text-primary">pd.DataFrame</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-semibold text-text-primary">calculate_sharpe_ratio</td>
                          <td className="p-2.5 text-text-secondary">services/analytics.py</td>
                          <td className="p-2.5 text-text-secondary">returns, risk_free_rate</td>
                          <td className="p-2.5 text-primary">float</td>
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

      {/* 3. Deep-Dive Section: The Four Core Specifications */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-6">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Specification Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
              Four foundational documents.
              <br />
              Derived from source code.
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Engineering teams spend hours reconstructing context on inherited codebases. ReadMyCode automates the generation of the four specifications required by software engineers and autonomous AI agents:
            </p>

            <div className="space-y-4 pt-2">
              <div className="border-l-2 border-primary pl-4 py-1">
                <h3 className="text-sm font-semibold text-text-primary">README.md</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Complete setup guides, runtime prerequisites, environment configurations, and usage steps.
                </p>
              </div>

              <div className="border-l-2 border-border pl-4 py-1">
                <h3 className="text-sm font-semibold text-text-primary">ARCHITECTURE.md</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Component hierarchy, data flow boundaries, network ingress, and persistence mapping.
                </p>
              </div>

              <div className="border-l-2 border-border pl-4 py-1">
                <h3 className="text-sm font-semibold text-text-primary">AGENTS.md</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Coding standards, error contracts, and guardrails for autonomous coding assistants.
                </p>
              </div>

              <div className="border-l-2 border-border pl-4 py-1">
                <h3 className="text-sm font-semibold text-text-primary">TASK_BREAKDOWN.md</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Phased implementation sequence with verifiable milestones and dependency paths.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-subtle font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-text-muted text-[11px]">ARCHITECTURE.md (Excerpt)</span>
              <span className="text-[10px] text-text-muted">Generated Artifact</span>
            </div>
            <pre className="text-text-secondary text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {`# System Architecture

## Component Layering
1. Presentation: React 18 single-page application.
2. Ingress: Express.js REST API with rate limiting.
3. Analysis Engine: AST walker & AI inference.
4. Storage: MongoDB Atlas with direct shard connection.

## Security Constraints
- Ephemeral processing: unzipped files cleared after run.
- Zero credential leakage: secrets stripped prior to indexing.
- Transport: End-to-end TLS encryption.`}
            </pre>
          </div>
        </div>
      </section>

      {/* 4. Deep-Dive Section: Visual Topology & AST Call-Site Graphs */}
      <section className="py-20 bg-background-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="order-2 lg:order-1 bg-card border border-border rounded-xl p-5 shadow-subtle font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <span className="text-text-muted text-[11px]">call-graph-generator.js</span>
                <span className="text-[10px] text-primary font-medium">AST Verified</span>
              </div>
              <div className="space-y-3 text-[11px] text-text-secondary">
                <p className="text-text-primary font-semibold">
                  1. Parse Abstract Syntax Tree
                </p>
                <p>
                  Extract import declarations, exported symbols, function calls, and controller routes across JavaScript, TypeScript, and Python.
                </p>
                <p className="text-text-primary font-semibold pt-2">
                  2. Construct Component Graph
                </p>
                <p>
                  Identify ingress endpoints, middleware pipelines, service layers, and database queries to generate Mermaid.js diagrams.
                </p>
                <p className="text-text-primary font-semibold pt-2">
                  3. Render Interactive Diagram
                </p>
                <p>
                  Display pan-and-zoom architecture flowcharts with secondary SVG fallbacks for reliable inspection on all browsers.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted">
                Visual Comprehension
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
                Visual logic mapping.
                <br />
                Direct from source code.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed">
                Reading multi-module repositories line by line is inefficient. ReadMyCode traces execution paths from incoming HTTP requests through database mutations, presenting system topology as clear, interactive diagrams.
              </p>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/analyze')}
                >
                  Explore Diagram Generator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Runtimes */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
            Broad Compatibility
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary">
            Tested across modern ecosystems.
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Static extraction algorithms adapt to your project runtime and directory patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-2">JavaScript & TypeScript</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Node.js, Express, React, Next.js, and TypeScript projects. Extracts route signatures, exports, and React component trees.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-text-muted">
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">React</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Next.js</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Express</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">TypeScript</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Python Ecosystem</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              FastAPI, Flask, Django, and Streamlit applications. Parses typed functions, docstrings, and dependencies.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-text-muted">
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">FastAPI</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Django</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Streamlit</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Flask</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Backend & Microservices</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Go services, Rust crates, and multi-service repositories. Maps module hierarchies and Docker configurations.
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-text-muted">
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Go</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Rust</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">Docker</span>
              <span className="px-2 py-0.5 bg-background-secondary rounded border border-border">REST</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Restrained Call to Action */}
      <section className="py-20 bg-background-secondary border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Document your next codebase in seconds.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-8 font-normal">
            Paste any public GitHub repository URL or upload a ZIP file to inspect the complete specification and architecture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/analyze')}
            >
              Start Analysis Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In to Save History
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;