import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, KeyRound, User, ExternalLink, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

export default function GithubConnectModal({ isOpen, onClose, onSuccess }) {
  const { loginWithGithub } = useAuth();
  const [method, setMethod] = useState('token'); // 'token' | 'username'
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (method === 'token' && !token.trim()) {
      setError('Please provide a GitHub Personal Access Token');
      return;
    }
    if (method === 'username' && !username.trim()) {
      setError('Please provide your GitHub username');
      return;
    }

    setLoading(true);
    try {
      const payload = method === 'token' ? { token: token.trim() } : { username: username.trim() };
      const res = await loginWithGithub(payload);
      if (res.success) {
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Failed to connect GitHub account');
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-border/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-background-secondary border border-border flex items-center justify-center shadow-md">
              <Github className="w-6 h-6 text-text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Connect to GitHub</h2>
              <p className="text-xs text-text-muted">Import repositories directly with 1-click just like Vercel</p>
            </div>
          </div>

          {/* Method selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-background-secondary p-1 rounded-xl mb-5 border border-border">
            <button
              type="button"
              onClick={() => setMethod('token')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                method === 'token'
                  ? 'bg-card text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>Access Token (Full Access)</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('username')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                method === 'username'
                  ? 'bg-card text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Public Username</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === 'token' ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    GitHub Personal Access Token (Classic or Fine-grained)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=ReadMyCode%20Integration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                  >
                    Generate Token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-secondary border border-border rounded-xl text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                />
                <div className="mt-2 p-2.5 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Tokens allow ReadMyCode to securely read your public & private repositories and export documentation. We never store passwords.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                  GitHub Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. akshatanand-cell or torvalds"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-secondary border border-border rounded-xl text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-[11px] text-text-muted mt-1.5">
                  Allows instant 1-click import of all your public GitHub repositories without requiring a token.
                </p>
              </div>
            )}

            {error && <p className="text-xs text-error">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {method === 'token' ? 'Connect with Token' : 'Connect Account'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
