import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Shield, ExternalLink, Mail, Cookie, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/newsletter/subscribe`, {
        email: newsletterEmail.trim(),
      });
      setIsSubscribed(true);
      toast.success(res.data?.message || 'Subscribed! Check your inbox for confirmation.');
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open-cookie-settings'));
  };

  return (
    <footer className="border-t border-border bg-card text-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-background-secondary via-card to-background-secondary border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Developer Newsletter</span>
            </span>
            <h4 className="text-base font-bold text-text-primary tracking-tight">
              Get codebase intelligence tips & release updates
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              No spam. No promotional clutter. Only practical updates on AST analysis, agent architecture rules, and product features. Unsubscribe anytime in 1 click.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>You're subscribed! Confirmation email sent.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="developer@domain.com"
                  className="px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 font-mono"
                  aria-label="Email address for newsletter"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs whitespace-nowrap min-h-[36px]"
                >
                  Subscribe
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="hover:text-text-primary transition-colors text-emerald-400 font-medium">
                  Pricing & Plans
                </Link>
              </li>
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
                <span className="text-text-primary font-medium">README.md</span>
                <span className="block text-[11px] text-text-muted">Structured project overview</span>
              </li>
              <li>
                <span className="text-text-primary font-medium">ARCHITECTURE.md</span>
                <span className="block text-[11px] text-text-muted">Component topology and layers</span>
              </li>
              <li>
                <span className="text-text-primary font-medium">AGENTS.md</span>
                <span className="block text-[11px] text-text-muted">Agent execution constitution</span>
              </li>
              <li>
                <span className="text-text-primary font-medium">TASK_BREAKDOWN.md</span>
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
              <li>
                <a
                  href="mailto:support@readmycode.dev"
                  className="hover:text-text-primary transition-colors"
                >
                  Developer Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div>
            <h3 className="text-text-primary font-medium text-xs tracking-wider uppercase mb-3">
              Legal & Compliance
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-text-primary transition-colors text-emerald-400 font-medium">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="hover:text-text-primary transition-colors flex items-center gap-1 text-[11px] text-text-muted focus:outline-none focus:underline"
                >
                  <Cookie className="w-3 h-3 text-emerald-400" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
              <li>
                <Link to="/unsubscribe" className="hover:text-text-primary transition-colors text-[11px] text-text-muted">
                  Email Preferences & Unsubscribe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Business Details & Copyright */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-text-muted text-[11px] text-center sm:text-left">
            <span>ReadMyCode &copy; {new Date().getFullYear()}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>
              Operated by{' '}
              <a
                href="https://github.com/akshatanand-cell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-primary font-medium transition-colors underline underline-offset-2"
              >
                Akshat Anand
              </a>
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Bengaluru, India &bull; Support: support@readmycode.dev</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-text-muted">
            <Link to="/privacy" className="hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
            <Link to="/refund" className="hover:text-text-primary transition-colors">
              Refunds
            </Link>
            <Link to="/cookies" className="hover:text-text-primary transition-colors">
              Cookies
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
