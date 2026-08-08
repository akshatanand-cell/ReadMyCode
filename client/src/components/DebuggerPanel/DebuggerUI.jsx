import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Send, RotateCcw, Lightbulb, AlertCircle, CheckCircle, Terminal, ChevronRight, Copy } from 'lucide-react';
import { cn } from '@/utils/helpers';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const DebuggerUI = ({ onDebug, isLoading, className }) => {
  const [errorInput, setErrorInput] = useState('');
  const [context, setContext] = useState('');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!errorInput.trim() || isLoading) return;

    const query = { error: errorInput, context: context || undefined };
    const newHistoryItem = {
      id: Date.now(),
      error: errorInput,
      context: context,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => [newHistoryItem, ...prev].slice(0, 20));

    const result = await onDebug?.(query);
    if (result) {
      setResults(result);
    }
  };

  const handleReset = () => {
    setErrorInput('');
    setContext('');
    setResults(null);
  };

  const handleHistoryClick = (item) => {
    setErrorInput(item.error);
    setContext(item.context || '');
    setResults(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
            <Bug className="w-5 h-5 text-error" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI Debugger</h2>
            <p className="text-sm text-text-secondary">
              Paste an error message or stack trace to get AI-powered debugging assistance
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Error Message / Stack Trace <span className="text-error">*</span>
            </label>
            <textarea
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              placeholder="Paste your error message here...
Example: TypeError: Cannot read property 'map' of undefined
    at UserList (UserList.jsx:23:15)"
              rows={6}
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Additional Context <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any additional context: recent changes, expected behavior, environment details..."
              rows={3}
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!errorInput.trim() || isLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {isLoading ? 'Analyzing...' : 'Debug Error'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {results.rootCause && (
              <Card className="border-l-4 border-l-error">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-error mb-1">Root Cause</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {results.rootCause}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {(results.suggestedFix || results.solution) && (
              <Card className="border-l-4 border-l-success">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-success mb-1">Suggested Solution & Fix</h3>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {results.suggestedFix || results.solution}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {results.codeFix && (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-text-primary">Code Fix</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(results.codeFix)}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <pre className="p-4 bg-[#0d1117] rounded-lg overflow-x-auto border border-border">
                  <code className="text-sm font-mono text-text-secondary">
                    {results.codeFix}
                  </code>
                </pre>
              </Card>
            )}

            {results.explanation && (
              <Card className="border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-primary mb-1">Explanation</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {results.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {results.prevention && (
              <Card className="border-l-4 border-l-accent">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-accent mb-1">Prevention</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {results.prevention}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {results.relatedErrors && results.relatedErrors.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Related Errors</h3>
                <div className="space-y-2">
                  {results.relatedErrors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-background-secondary rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-text-primary font-medium">{err.error}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{err.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && !results && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Queries</h3>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left p-3 bg-background-secondary hover:bg-white/5 rounded-lg transition-colors group"
              >
                <p className="text-sm text-text-primary truncate group-hover:text-primary transition-colors">
                  {item.error}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DebuggerUI;