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
  CreditCard,
  QrCode,
  Package,
  Calendar,
  Infinity as InfinityIcon,
  HelpCircle,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Pricing() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [pricingTab, setPricingTab] = useState('monthly'); // 'monthly' | 'packs'
  const [currency, setCurrency] = useState('usd'); // 'usd' | 'inr'
  const [gateways, setGateways] = useState({
    stripe: { enabled: false, publishableKey: '' },
    razorpay: { enabled: false, keyId: '' },
  });
  const [usage, setUsage] = useState({
    plan: 'free',
    monthlyScans: 0,
    scanLimit: 15,
    hasStripeSubscription: false,
  });

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

    // Fetch gateway availability
    axios
      .get(`${API_BASE}/api/billing/config`)
      .then((res) => {
        setGateways(res.data);
        if (res.data?.razorpay?.enabled && !res.data?.stripe?.enabled) {
          setCurrency('inr');
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPlan = async (planId, gatewayChoice = null) => {
    if (!user || user.id === 'demo_guest' || user._id === 'demo_guest') {
      toast('Please sign in to select a plan.', { icon: '🔒' });
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      navigate('/analyze');
      return;
    }

    const token = localStorage.getItem('token');
    setLoadingPlan(planId);

    // Prefer Razorpay if user explicitly picked INR / Razorpay
    const useRazorpay =
      (gatewayChoice === 'razorpay' || currency === 'inr') &&
      gateways.razorpay?.enabled;

    try {
      if (useRazorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Failed to load Razorpay payment SDK. Please check your connection.');
          setLoadingPlan(null);
          return;
        }

        const orderRes = await axios.post(
          `${API_BASE}/api/billing/razorpay/create-order`,
          { planId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { orderId, amount, currency: orderCurrency, keyId, plan } = orderRes.data;

        const options = {
          key: keyId,
          amount,
          currency: orderCurrency,
          name: 'ReadMyCode',
          description: `Upgrade to ${plan.name}`,
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(
                `${API_BASE}/api/billing/razorpay/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              toast.success(verifyRes.data?.message || 'Payment successful! Account upgraded.');
              await checkAuth();
              setUsage((prev) => ({ ...prev, plan: planId, scanLimit: 'unlimited' }));
              navigate('/dashboard?upgraded=true');
            } catch (vErr) {
              toast.error(vErr.response?.data?.message || 'Payment signature verification failed.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#0071e3',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          toast.error(`Payment failed: ${resp.error?.description || 'Transaction canceled'}`);
        });
        rzp.open();
        return;
      }

      // Default: Stripe Checkout (or Demo fallback if Stripe keys are not set)
      const res = await axios.post(
        `${API_BASE}/api/billing/checkout`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.url) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = res.data.url;
      } else {
        // Demo Activation Fallback
        toast.success(res.data?.message || 'Pro subscription activated (Demo Mode)!');
        await checkAuth();
        setUsage((prev) => ({ ...prev, plan: planId, scanLimit: 'unlimited' }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    const token = localStorage.getItem('token');
    setPortalLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/billing/portal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (planId) => {
    const current = user?.plan || usage.plan || 'free';
    return current === planId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-text-primary">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
          Document Your Codebase in Seconds
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          From independent hackers to growing software teams. Select a monthly plan or a one-time pack to power your continuous documentation pipeline.
        </p>

        {/* Current Plan Indicator & Stripe Portal Link */}
        {user && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-card border border-border text-xs text-text-secondary">
              <span>Account Plan:</span>
              <strong className="text-emerald-400 uppercase font-mono">{user.plan || usage.plan || 'Free'}</strong>
              <span>&bull;</span>
              <span>Scans used: {usage.monthlyScans} / {usage.scanLimit}</span>
            </span>

            {usage.hasStripeSubscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                isLoading={portalLoading}
                className="text-xs"
              >
                Manage Subscription (Stripe Portal)
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs & Currency Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto mb-12 p-2 rounded-2xl bg-card border border-border">
        {/* Plan Type Selector */}
        <div className="flex items-center p-1 rounded-xl bg-background-secondary w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPricingTab('monthly')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              pricingTab === 'monthly'
                ? 'bg-card text-text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Subscriptions</span>
          </button>
          <button
            type="button"
            onClick={() => setPricingTab('packs')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition ${
              pricingTab === 'packs'
                ? 'bg-card text-text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>One-Time Power Packs</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">No Sub</span>
          </button>
        </div>

        {/* Currency & Gateway Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-text-muted" /> Currency:
          </span>
          <div className="flex items-center p-0.5 rounded-lg bg-background-secondary border border-border text-xs">
            <button
              type="button"
              onClick={() => setCurrency('usd')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                currency === 'usd'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('inr')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                currency === 'inr'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              INR (₹ UPI)
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Subscriptions View */}
      {pricingTab === 'monthly' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {/* Free Developer */}
          <Card className="flex flex-col justify-between p-8 border border-border bg-card relative rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Free Developer</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-border text-text-muted text-xs font-medium">Free</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">{currency === 'inr' ? '₹0' : '$0'}</span>
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
                  <span>Public GitHub repos & ZIP uploads (up to 4MB)</span>
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
                  <span>Ephemeral code processing (zero AI training)</span>
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

          {/* Pro Engineer (Featured) */}
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
                <span className="text-4xl font-extrabold text-text-primary">
                  {currency === 'inr' ? '₹999' : '$12'}
                </span>
                <span className="text-text-muted text-sm ml-2">/ month</span>
                <p className="text-xs text-text-muted mt-1">For professional developers, engineers, and consultants.</p>
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
              {isCurrentPlan('pro') ? 'Current Active Plan' : currency === 'inr' ? 'Pay ₹999 with UPI / Card' : 'Upgrade to Pro ($12)'}
            </Button>
          </Card>

          {/* Team & Org */}
          <Card className="flex flex-col justify-between p-8 border border-border bg-card relative rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  Team & Enterprise
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-border text-text-muted text-xs font-medium">Team</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">
                  {currency === 'inr' ? '₹3,999' : '$49'}
                </span>
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
                  <span>Shared team repository workspace & audit logs</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Custom AI agent rules & compliance presets</span>
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
              {isCurrentPlan('team') ? 'Current Active Plan' : currency === 'inr' ? 'Select Team (₹3,999)' : 'Select Team Plan ($49)'}
            </Button>
          </Card>
        </div>
      )}

      {/* One-Time Power Packs View */}
      {pricingTab === 'packs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto mb-20">
          {/* 50-Scans Power Pack */}
          <Card className="flex flex-col justify-between p-8 border border-border bg-card relative rounded-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-primary" />
                  50-Scans Power Pack
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">One-Time</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">
                  {currency === 'inr' ? '₹1,499' : '$19'}
                </span>
                <span className="text-text-muted text-sm ml-2">/ one-time</span>
                <p className="text-xs text-text-muted mt-1">Zero recurring fees. Credits never expire.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border mb-8 text-xs text-text-secondary">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>50 deep repository analyses</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Credits never expire — use at your own pace</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Private GitHub repositories & encrypted token vault</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Full vector SVG diagram and specification exports</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full text-sm font-semibold"
              onClick={() => handleSelectPlan('pack_50')}
              isLoading={loadingPlan === 'pack_50'}
            >
              {currency === 'inr' ? 'Purchase Pack for ₹1,499' : 'Purchase 50 Scans ($19)'}
            </Button>
          </Card>

          {/* Lifetime License */}
          <Card className="flex flex-col justify-between p-8 border-2 border-primary/80 bg-gradient-to-b from-card to-background-secondary relative rounded-2xl shadow-xl shadow-primary/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
              Pay Once, Own Forever
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                  <InfinityIcon className="w-4 h-4 text-primary" />
                  Lifetime License
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">Lifetime</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">
                  {currency === 'inr' ? '₹7,999' : '$99'}
                </span>
                <span className="text-text-muted text-sm ml-2">/ forever</span>
                <p className="text-xs text-text-muted mt-1">Unlimited scans forever. All future AI models included.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border mb-8 text-xs text-text-secondary">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-text-primary">Unlimited scans forever</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Zero recurring monthly or annual subscription fees</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>All upcoming Grok-3 and reasoning models included</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Permanent VIP priority serverless compute queue</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full text-sm font-semibold shadow-lg shadow-primary/25"
              onClick={() => handleSelectPlan('lifetime')}
              isLoading={loadingPlan === 'lifetime'}
              disabled={isCurrentPlan('lifetime')}
            >
              {isCurrentPlan('lifetime') ? 'Lifetime Active' : currency === 'inr' ? 'Get Lifetime Access (₹7,999)' : 'Get Lifetime Access ($99)'}
            </Button>
          </Card>
        </div>
      )}

      {/* Payment Security & Refund Guarantee Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-card border border-border mb-12">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">14-Day Refund Guarantee</h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Not completely satisfied? Email support within 14 days for a prompt refund. See our{' '}
              <Link to="/refund" className="text-primary hover:underline font-medium">
                Refund Policy
              </Link>.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Bank-Grade Payment Security</h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Processed securely via Stripe & Razorpay. We never store or see your raw credit card or banking credentials.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Instant Compute Activation</h4>
            <p className="text-[11px] text-text-muted mt-0.5">
              Your account is upgraded within seconds of payment completion. Zero waiting or manual provisioning required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
