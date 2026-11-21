import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowRight, Sparkles, Check, Github, Zap } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthUpgradeModal({ isOpen, onClose, plan, onAuthenticated }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Minimum 6 characters required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({ email: formData.email, password: formData.password });
        if (res?.success) {
          toast.success(`Welcome back! Continuing with ${plan?.name || 'upgrade'}...`);
          onClose();
          if (onAuthenticated) onAuthenticated(res.user);
        }
      } else {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          securityQuestion: 'What is your favorite code editor?',
          securityAnswer: 'VS Code',
        });
        if (res?.success) {
          toast.success(`Account created! Continuing with ${plan?.name || 'upgrade'}...`);
          onClose();
          if (onAuthenticated) onAuthenticated(res.user);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      // 1-Click instant sign-in for testing or preview
      const demoEmail = `developer_${Date.now().toString().slice(-4)}@example.com`;
      const res = await register({
        name: 'Developer Pro',
        email: demoEmail,
        password: 'password123',
        securityQuestion: 'What is your favorite code editor?',
        securityAnswer: 'VS Code',
      });
      if (res?.success) {
        toast.success(`Signed in as ${demoEmail}! Activating plan...`);
        onClose();
        if (onAuthenticated) onAuthenticated(res.user);
      }
    } catch {
      // Fallback: regular login with demo developer credentials
      const res = await login({ email: 'developer@example.com', password: 'password123' }).catch(() => null);
      if (res?.success) {
        toast.success('Signed in as demo developer!');
        onClose();
        if (onAuthenticated) onAuthenticated(res.user);
      } else {
        toast('Please enter your email and password below.', { icon: 'ℹ️' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Link Subscription to Account</span>
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {mode === 'login' ? 'Sign in to Continue' : 'Create an Account to Continue'}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Upgrading to <strong className="text-emerald-400">{plan?.name || 'Pro Plan'}</strong>
            {plan?.price !== undefined && (
              <span className="ml-1 text-text-muted">
                (${plan.price} {plan.interval ? `/ ${plan.interval}` : ''})
              </span>
            )}
          </p>
        </div>

        {/* Plan Value Highlight */}
        <div className="p-3 mb-5 rounded-xl bg-background-secondary border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Unlimited scans, private repos & priority compute</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Instant
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Developer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password (min 6 chars)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 shadow-lg shadow-emerald-500/20"
            isLoading={loading}
          >
            {mode === 'login' ? 'Sign In & Upgrade' : 'Create Account & Upgrade'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrors({});
            }}
            className="text-primary hover:underline font-semibold"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in instead'}
          </button>
        </div>

        {/* 1-Click Instant Demo Login for Testing */}
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary transition"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Or test instantly with 1-Click Demo Sign-in &rarr;</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
