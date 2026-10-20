import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card text-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="hover:text-text-primary transition-colors">
                  Analyze Codebase
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-text-primary transition-colors">
                  Repository Workspace
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-text-primary transition-colors">
                  Analysis History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Specifications */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Specifications
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-text-primary">README.md</span>
                <span className="block text-[11px] text-text-muted">Structured project overview</span>
              </li>
              <li>
                <span className="text-text-primary">ARCHITECTURE.md</span>
                <span className="block text-[11px] text-text-muted">Component topology and layers</span>
              </li>
              <li>
                <span className="text-text-primary">AGENTS.md</span>
                <span className="block text-[11px] text-text-muted">Agent execution constitution</span>
              </li>
              <li>
                <span className="text-text-primary">TASK_BREAKDOWN.md</span>
                <span className="block text-[11px] text-text-muted">Phased implementation roadmap</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="hover:text-text-primary transition-colors">
                  Help & Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/akshatanand-cell/ReadMyCode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-text-muted">Python, Node.js, Go, Rust runtimes</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Privacy */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Legal & Trust
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-background-secondary border border-border text-text-muted">
                  Draft
                </span>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-background-secondary border border-border text-text-muted">
                  Draft
                </span>
              </li>
              <li>
                <span className="text-[11px] text-text-muted block mt-1">
                  Repositories are processed for documentation generation. Ephemeral storage is cleared after analysis.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-[11px]">
            Copyright &copy; {new Date().getFullYear()} ReadMyCode. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[11px] text-text-muted">
            <Link to="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
