import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    // Auto-trigger if both params are present (1-click unsubscribe)
    if (emailParam && tokenParam) {
      handleAutoUnsubscribe(emailParam, tokenParam);
    }
  }, [searchParams]);

  const handleAutoUnsubscribe = async (unsubEmail, unsubToken) => {
    setStatus('loading');
    try {
      const res = await axios.post(`${API_BASE}/api/newsletter/unsubscribe`, {
        email: unsubEmail,
        token: unsubToken,
      });
      setStatus('success');
      setMessage(res.data?.message || 'You have been successfully unsubscribed.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to process unsubscribe request.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setStatus('loading');
    try {
      const res = await axios.post(`${API_BASE}/api/newsletter/unsubscribe`, {
        email: email.trim(),
        token: token || 'manual_request',
      });
      setStatus('success');
      setMessage(res.data?.message || 'You have been successfully unsubscribed.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to process unsubscribe request.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-text-primary">
      <Card className="p-8 border border-border bg-card rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Email Preferences
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your marketing & newsletter subscription for ReadMyCode
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              You will no longer receive marketing dispatches or promotional offers. Crucial security and password recovery emails will still be delivered when requested.
            </p>
            <div className="pt-2">
              <Link to="/">
                <Button variant="secondary" className="w-full text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background-secondary border border-border text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              isLoading={status === 'loading'}
              className="w-full text-xs hover:border-error/40 hover:text-error"
            >
              Unsubscribe from All Marketing Emails
            </Button>

            <p className="text-[11px] text-text-muted text-center pt-2 leading-relaxed">
              In accordance with CAN-SPAM and GDPR, unsubscribe requests are processed immediately.
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
