import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function GithubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGithub } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || 'GitHub authorization was declined.');
      toast.error(errorDescription || 'GitHub authorization declined');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code received from GitHub.');
      setTimeout(() => navigate('/login'), 2500);
      return;
    }

    const exchangeCode = async () => {
      try {
        const res = await loginWithGithub({ code });
        if (res.success) {
          setStatus('success');
          toast.success('Successfully connected to GitHub!');
          if (res.user?.githubUsername) {
            localStorage.setItem('github_username', res.user.githubUsername);
          }
          setTimeout(() => navigate('/analyze'), 1200);
        } else {
          setStatus('error');
          setErrorMessage(res.message || 'Failed to authenticate with GitHub.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Unexpected error occurred.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    exchangeCode();
  }, [searchParams, loginWithGithub, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border flex items-center justify-center mx-auto mb-5 shadow-lg relative">
          <Github className="w-8 h-8 text-text-primary" />
          {status === 'processing' && (
            <div className="absolute -inset-1 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">Authenticating with GitHub</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Exchanging your GitHub passkey authorization and connecting your repositories...
            </p>
            <div className="flex items-center justify-center gap-2 pt-2 text-primary text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-emerald-400">Connected to GitHub!</h2>
            <p className="text-xs text-text-muted">
              Redirecting you to your repositories...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-error/10 border border-error/20 text-error flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-error">Authentication Failed</h2>
            <p className="text-xs text-text-secondary">{errorMessage}</p>
            <p className="text-[11px] text-text-muted pt-2">Returning to login screen...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
