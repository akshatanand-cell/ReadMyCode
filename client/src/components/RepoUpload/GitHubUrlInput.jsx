import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Link2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/helpers';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?$/;

const GitHubUrlInput = ({ onSubmit, isLoading, className }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const validateUrl = (value) => {
    if (!value) {
      setError(null);
      setIsValid(false);
      return;
    }
    if (GITHUB_URL_REGEX.test(value)) {
      setError(null);
      setIsValid(true);
    } else {
      setError('Please enter a valid GitHub repository URL');
      setIsValid(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onSubmit?.(url);
  };

  const extractRepoName = (url) => {
    try {
      const parts = url.replace(/\/$/, '').split('/');
      return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    } catch {
      return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="space-y-4">
        <Input
          label="GitHub Repository URL"
          placeholder="https://github.com/username/repository"
          value={url}
          onChange={handleChange}
          leftIcon={<Github className="w-4 h-4" />}
          error={error}
          helperText="Paste a public GitHub repository link"
          disabled={isLoading}
        />

        <AnimatePresence>
          {isValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">
                  {extractRepoName(url)}
                </p>
                <p className="text-xs text-text-secondary">Valid repository URL</p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!isValid || isLoading}
          className="w-full"
          leftIcon={<Link2 className="w-4 h-4" />}
        >
          {isLoading ? 'Analyzing Repository...' : 'Analyze Repository'}
        </Button>
      </div>
    </form>
  );
};

export default GitHubUrlInput;