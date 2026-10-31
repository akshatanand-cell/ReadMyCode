import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Pricing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [usage, setUsage] = useState({ plan: 'free', monthlyScans: 0, scanLimit: 15 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE}/api/billing/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsage(res.data))
        .catch(() => {});
    }
  }, []);

  const handleSelectPlan = async (planId) => {
    if (!user || user.id === 'demo_guest' || user._id === 'demo_guest') {
      toast('Please sign in to select a plan.', { icon: '🔒' });
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      navigate('/analyze');
      return;
    }

    setLoadingPlan(planId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/billing/checkout`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.success(res.data?.message || 'Pro subscription activated!');
        setUsage((prev) => ({ ...prev, plan: planId, scanLimit: 'unlimited' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId) => {
    const current = user?.plan || usage.plan || 'free';
    return current === planId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-text-primary">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
          Document Your Codebase in Seconds
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          From independent open-source hackers to fast-scaling engineering teams. Choose the plan that powers your documentation pipeline.
        </p>

        {user && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-card border border-border text-xs text-text-secondary">
              <span>Current Account Plan:</span>
              <strong className="text-emerald-400 uppercase font-mono">{user.plan || usage.plan || 'Free'}</strong>
              <span>&bull;</span>
              <span>Scans used: {usage.monthlyScans} / {usage.scanLimit}</span>
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {/* Tier 1: Free */}
        <Card className="flex flex-col justify-between p-8 border border-border bg-card relative rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Free Developer</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-border text-text-muted text-xs font-medium">Free</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-text-primary">$0</span>
              <span className="text-text-muted text-sm ml-2">/ forever</span>
              <p className="text-xs text-text-muted mt-1">Perfect for discovering ReadMyCode on personal repositories.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border mb-8 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>15 repository scans</strong> per month</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Public GitHub repos & ZIP uploads</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Architecture, README & Agents specifications</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Interactive Mermaid flowcharts & AST parsing</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Ephemeral code processing (zero training)</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full text-sm font-semibold"
            onClick={() => handleSelectPlan('free')}
            disabled={isCurrentPlan('free')}
          >
            {isCurrentPlan('free') ? 'Current Plan' : 'Get Started Free'}
          </Button>
        </Card>

        {/* Tier 2: Pro (Featured) */}
        <Card className="flex flex-col justify-between p-8 border-2 border-emerald-500/80 bg-gradient-to-b from-card to-background-secondary relative rounded-2xl shadow-2xl shadow-emerald-500/10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-bold uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Pro Engineer
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">Pro</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-text-primary">$12</span>
              <span className="text-text-muted text-sm ml-2">/ month</span>
              <p className="text-xs text-text-muted mt-1">For professional developers, consultants, and teams.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border mb-8 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-text-primary">Unlimited repository scans</strong></span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Private GitHub repositories</strong> & encrypted token vault</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deep Grok-2 & Llama 70B AI inference</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>High-resolution SVG & PNG vector diagram exports</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated GitHub Action continuous CI updates</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Priority compute queue & Ask Grok AI chatbot</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25"
            onClick={() => handleSelectPlan('pro')}
            isLoading={loadingPlan === 'pro'}
            disabled={isCurrentPlan('pro')}
          >
            {isCurrentPlan('pro') ? 'Current Active Plan' : 'Upgrade to Pro'}
          </Button>
        </Card>

        {/* Tier 3: Team */}
        <Card className="flex flex-col justify-between p-8 border border-border bg-card relative rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                Team & Org
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-border text-text-muted text-xs font-medium">Team</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-text-primary">$49</span>
              <span className="text-text-muted text-sm ml-2">/ month</span>
              <p className="text-xs text-text-muted mt-1">For organizations needing shared workspaces and custom rules.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border mb-8 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Everything in Pro</strong>, up to 10 seats</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Shared team repository workspace</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Custom AI agent rules & compliance constitution presets</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Custom webhook automation pipelines</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Dedicated SLA & priority support</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full text-sm font-semibold"
            onClick={() => handleSelectPlan('team')}
            isLoading={loadingPlan === 'team'}
            disabled={isCurrentPlan('team')}
          >
            {isCurrentPlan('team') ? 'Current Active Plan' : 'Select Team Plan'}
          </Button>
        </Card>
      </div>

      {/* Security & Guarantee Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Zero Code Training</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Your code is processed ephemerally and never used for foundation model training.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">AES-256 Encrypted</h4>
            <p className="text-[11px] text-text-muted mt-0.5">GitHub access tokens are encrypted at rest with authenticated AES-256-GCM.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Instant Activation</h4>
            <p className="text-[11px] text-text-muted mt-0.5">Upgrade or cancel anytime with transparent usage-based billing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
