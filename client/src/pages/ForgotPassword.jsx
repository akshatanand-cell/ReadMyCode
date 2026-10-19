import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Mail,
  ShieldQuestion,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [step, setStep] = useState(1); // 1: Email lookup, 2: Security question + reset
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Step 1: Query security question for the email
  const handleLookupQuestion = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.getSecurityQuestion(email.trim());
      if (res.data?.securityQuestion) {
        setSecurityQuestion(res.data.securityQuestion);
        setStep(2);
        toast.success('Security question retrieved! Please answer below.');
      } else {
        toast.error('No security question configured for this account.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to find account with that email';
      toast.error(msg);
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify answer and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = 'Please provide your security answer';
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPasswordWithSecurity({
        email: email.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword,
      });

      const { token, user } = res.data;
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (checkAuth) await checkAuth();
      }

      toast.success('Password reset successfully! Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect security answer. Please try again.';
      toast.error(msg);
      setErrors({ securityAnswer: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ReadMyCode</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Account Recovery
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            {step === 1
              ? 'Enter your email to verify your security question'
              : 'Answer your security question to reset your password'}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-card border border-border rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors',
                  step === 1
                    ? 'bg-primary text-white'
                    : 'bg-emerald-500 text-white'
                )}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </span>
              <span className="text-xs font-medium text-text-primary">Find Account</span>
            </div>
            <div className="w-10 h-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors',
                  step === 2
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-muted border border-border'
                )}
              >
                2
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  step === 2 ? 'text-text-primary' : 'text-text-muted'
                )}
              >
                Security Reset
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* Step 1: Email Lookup */
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLookupQuestion}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Your Registered Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
                    autoFocus
                  />
                  <p className="text-xs text-text-muted mt-2">
                    We will find the secret recovery question you configured during registration.
                  </p>
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Find Security Question
                </Button>
              </motion.form>
            ) : (
              /* Step 2: Answer Question & Set New Password */
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                {/* Account identifier & back toggle */}
                <div className="flex items-center justify-between p-2.5 bg-background-secondary border border-border rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-text-secondary truncate">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-mono truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                    }}
                    className="text-primary hover:underline font-medium shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>

                {/* Display Security Question */}
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5 text-primary">
                    <ShieldQuestion className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Your Security Question
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    &ldquo;{securityQuestion}&rdquo;
                  </p>
                </div>

                {/* Security Answer Input */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    Your Secret Answer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the answer you set during registration"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className={cn(
                      'input-field text-sm',
                      errors.securityAnswer && 'border-error focus:border-error focus:ring-error/50'
                    )}
                    autoFocus
                  />
                  {errors.securityAnswer && (
                    <p className="mt-1 text-xs text-error">{errors.securityAnswer}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cn(
                        'input-field pr-10 text-sm',
                        errors.newPassword && 'border-error focus:border-error focus:ring-error/50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-error">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      'input-field text-sm',
                      errors.confirmPassword && 'border-error focus:border-error focus:ring-error/50'
                    )}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={loading}
                    className="w-full"
                    rightIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Reset Password & Sign In
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to Login Footer */}
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-secondary">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign in
            </Link>
            <Link
              to="/register"
              className="text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}