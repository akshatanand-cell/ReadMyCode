import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Mail, User, Eye, EyeOff, Github, ShieldQuestion, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import GithubConnectModal from '@/components/common/GithubConnectModal';
import { authAPI } from '@/services/api';
import { SECURITY_QUESTIONS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  const handleGithubClick = async () => {
    try {
      const envClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      if (envClientId) {
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${envClientId}&scope=repo,read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
        return;
      }
      const res = await authAPI.getGithubConfig();
      if (res.data?.clientId) {
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${res.data.clientId}&scope=repo,read:user,user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
        return;
      }
    } catch {
      // fallback to modal
    }
    setIsGithubModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.securityQuestion) newErrors.securityQuestion = 'Please select a security question';
    if (!formData.securityAnswer.trim()) {
      newErrors.securityAnswer = 'Security answer is required for account recovery';
    } else if (formData.securityAnswer.trim().length < 2) {
      newErrors.securityAnswer = 'Security answer must be at least 2 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ReadMyCode</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create account</h1>
          <p className="text-text-secondary">Start analyzing your code today</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={cn(
                    'input-field pr-10',
                    errors.password && 'border-error focus:border-error focus:ring-error/50'
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
              {errors.password && <p className="mt-1.5 text-sm text-error">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={cn(
                  'input-field',
                  errors.confirmPassword && 'border-error focus:border-error focus:ring-error/50'
                )}
              />
              {errors.confirmPassword && <p className="mt-1.5 text-sm text-error">{errors.confirmPassword}</p>}
            </div>

            {/* Security Question for Password Recovery */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldQuestion className="w-4 h-4 text-primary" />
                <label className="block text-sm font-semibold text-text-primary">
                  Password Recovery Question
                </label>
              </div>
              <p className="text-xs text-text-muted mb-2.5">
                Choose 1 of the 10 security questions to protect and recover your account if you ever forget your password.
              </p>
              <select
                value={formData.securityQuestion}
                onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                className="input-field bg-background-secondary cursor-pointer text-sm mb-3"
              >
                {SECURITY_QUESTIONS.map((question, idx) => (
                  <option key={idx} value={question} className="bg-card text-text-primary">
                    {idx + 1}. {question}
                  </option>
                ))}
              </select>
              {errors.securityQuestion && (
                <p className="mt-1 text-sm text-error">{errors.securityQuestion}</p>
              )}

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-text-muted" />
                  Your Secret Answer
                </label>
                <input
                  type="text"
                  placeholder="Enter your memorable answer"
                  value={formData.securityAnswer}
                  onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                  className={cn(
                    'input-field text-sm',
                    errors.securityAnswer && 'border-error focus:border-error focus:ring-error/50'
                  )}
                />
                {errors.securityAnswer && (
                  <p className="mt-1.5 text-sm text-error">{errors.securityAnswer}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" required className="w-4 h-4 rounded border-border bg-background-secondary text-primary focus:ring-primary" />
              <span className="text-sm text-text-secondary">
                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-text-muted">Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGithubClick}
              className="mt-4 w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-background-secondary border border-border rounded-xl text-text-primary hover:bg-border/30 hover:border-primary/50 transition-all shadow-sm font-semibold text-sm group"
            >
              <Github className="w-5 h-5 text-text-primary group-hover:scale-110 transition-transform" />
              <span>Continue with GitHub</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Sign in
          </Link>
        </p>

        {/* GitHub Connect Modal */}
        <GithubConnectModal
          isOpen={isGithubModalOpen}
          onClose={() => setIsGithubModalOpen(false)}
          onSuccess={() => navigate('/dashboard')}
        />
      </motion.div>
    </div>
  );
};

export default Register;