import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Shield, Heart, ExternalLink, Star } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card text-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/analyze" className="hover:text-text-primary transition-colors">
                  Analyze Repository
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
              <li>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Free & Open Source
                </span>
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

          {/* Column 3: Trust & Open Source */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Open Source
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/akshatanand-cell/ReadMyCode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-text-primary hover:text-primary transition-colors"
                  aria-label="Star on GitHub"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Star on GitHub</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/akshatanand-cell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Developer Profile
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:text-text-primary transition-colors">
                  Documentation & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Privacy */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Privacy Guarantee
            </h3>
            <div className="p-3 bg-background-secondary border border-border rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Transient Code Processing</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                We delete cloned source code immediately after analysis. Generated documentation and architecture specs are saved to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted text-[11px]">
            <span>ReadMyCode &copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              Built by{' '}
              <a
                href="https://github.com/akshatanand-cell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-primary font-medium transition-colors underline underline-offset-2"
              >
                Akshat Anand
              </a>
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-text-muted">
            <Link to="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
            <a
              href="https://github.com/akshatanand-cell/ReadMyCode"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
