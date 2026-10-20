import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, KeyRound, User, ExternalLink, ArrowRight, ShieldCheck, X, Sparkles, Fingerprint } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import Button from '@/components/common/Button';

export default function GithubConnectModal({ isOpen, onClose, onSuccess }) {
  const { loginWithGithub } = useAuth();
  const [method, setMethod] = useState('passkey'); // 'passkey' | 'username' | 'token'
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('akshatanand-cell');
  const [clientId, setClientId] = useState(import.meta.env.VITE_GITHUB_CLIENT_ID || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      authAPI.getGithubConfig()
        .then((res) => {
          if (res.data?.clientId) setClientId(res.data.clientId);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasskeyAuth = () => {
    if (clientId) {
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = url;
    } else {
      setError('OAuth Client ID not detected yet. Follow the 3-step setup below or use Instant Username connect.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (method === 'passkey') {
      handlePasskeyAuth();
      return;
    }

    if (method === 'username' && !username.trim()) {
      setError('Please provide your GitHub username');
      return;
    }

    if (method === 'token' && !token.trim()) {
      setError('Please provide a GitHub Personal Access Token');
      return;
    }

    setLoading(true);
    try {
      const payload = method === 'token' ? { token: token.trim() } : { username: username.trim() };
      const res = await loginWithGithub(payload);
      if (res.success) {
        if (res.user?.githubUsername) {
          localStorage.setItem('github_username', res.user.githubUsername);
        }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-background-secondary border border-border flex items-center justify-center shadow-md">
              <Github className="w-6 h-6 text-text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary tracking-tight">Connect to GitHub</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vercel Mode
                </span>
              </div>
              <p className="text-xs text-text-muted">Import repositories directly with 1-click just like Vercel</p>
            </div>
          </div>

          {/* Method selector tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-background-secondary p-1 rounded-xl mb-5 border border-border">
            <button
              type="button"
              onClick={() => { setMethod('passkey'); setError(''); }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                method === 'passkey'
                  ? 'bg-card text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-primary" />
              <span>1-Click Passkey</span>
            </button>
            <button
              type="button"
              onClick={() => { setMethod('username'); setError(''); }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                method === 'username'
                  ? 'bg-card text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant User</span>
            </button>
            <button
              type="button"
              onClick={() => { setMethod('token'); setError(''); }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                method === 'token'
                  ? 'bg-card text-text-primary shadow-sm border border-border/50'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Access Token</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === 'passkey' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    <span>Native GitHub OAuth (Vercel Style)</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Click below to open GitHub's official prompt. GitHub will ask for your passkey or biometric confirmation, authorize ReadMyCode, and log you in automatically with access to all your repositories.
                  </p>
                </div>

                {clientId ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePasskeyAuth}
                    className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Github className="w-5 h-5" />
                    <span>Authorize with GitHub Passkey</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="p-3 bg-background-secondary rounded-xl border border-border text-xs text-text-secondary space-y-2">
                      <p className="font-semibold text-text-primary">
                        How Vercel does 1-click Passkey auth:
                      </p>
                      <p className="text-[11px] leading-relaxed text-text-muted">
                        GitHub requires a registered <strong>OAuth App</strong> to show the passkey prompt. You can enable it for your domain in 30 seconds:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-[11px] text-text-secondary">
                        <li>
                          Go to{' '}
                          <a
                            href="https://github.com/settings/applications/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline font-medium inline-flex items-center gap-0.5"
                          >
                            GitHub Developer Settings <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>Set Authorization callback URL to: <code className="px-1 py-0.5 bg-card border rounded text-text-primary">{window.location.origin}/auth/github/callback</code></li>
                        <li>Add your <code className="text-primary">GITHUB_CLIENT_ID</code> and <code className="text-primary">GITHUB_CLIENT_SECRET</code> to your Vercel or local environment.</li>
                      </ol>
                    </div>

                    <div className="pt-1">
                      <p className="text-[11px] text-text-muted mb-2 text-center">
                        Want instant access right now without setup?
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setMethod('username')}
                        className="w-full text-xs font-semibold"
                      >
                        Use Instant Username Connect (Zero-Setup)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {method === 'username' && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  GitHub Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. akshatanand-cell"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-secondary border border-border rounded-xl text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                  Instant zero-config mode: pulls all 29 public repositories for your handle with 1-click import. No token or password needed.
                </p>
              </div>
            )}

            {method === 'token' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    GitHub Personal Access Token
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
                <div className="mt-2 p-2.5 bg-background-secondary border border-border rounded-lg flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Provides full access including private repositories if your OAuth app is not yet configured.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-error bg-error/10 border border-error/20 p-2.5 rounded-lg">
                {error}
              </p>
            )}

            {method !== 'passkey' && (
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
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
