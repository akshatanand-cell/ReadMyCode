import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, FileCode, GitBranch } from 'lucide-react';
import { cn } from '@/utils/helpers';
import ProgressBar from '@/components/common/ProgressBar';
import Card from '@/components/common/Card';

const STEPS = [
  { id: 'upload', label: 'Uploading', description: 'Sending repository data' },
  { id: 'parse', label: 'Parsing', description: 'Analyzing file structure' },
  { id: 'ast', label: 'AST Analysis', description: 'Building abstract syntax tree' },
  { id: 'ai', label: 'AI Processing', description: 'Generating documentation' },
  { id: 'complete', label: 'Complete', description: 'Analysis finished' },
];

const UploadProgress = ({ progress = 0, status = 'processing', error = null, source = 'github' }) => {
  const currentStepIndex = Math.min(
    Math.floor((progress / 100) * (STEPS.length - 1)),
    STEPS.length - 1
  );

  const getStepStatus = (index) => {
    if (error) return index <= currentStepIndex ? 'error' : 'pending';
    if (index < currentStepIndex) return 'complete';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  const stepIcons = {
    upload: FileCode,
    parse: GitBranch,
    ast: FileCode,
    ai: Loader2,
    complete: CheckCircle,
  };

  return (
    <Card className="w-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {error ? 'Analysis Failed' : progress >= 100 ? 'Analysis Complete' : 'Analyzing Repository'}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {error
                ? 'Something went wrong during analysis'
                : progress >= 100
                ? 'Your repository has been fully analyzed'
                : 'This may take a few minutes depending on repository size'}
            </p>
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            error ? 'bg-error/10' : progress >= 100 ? 'bg-success/10' : 'bg-primary/10'
          )}>
            {error ? (
              <AlertCircle className="w-6 h-6 text-error" />
            ) : progress >= 100 ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            )}
          </div>
        </div>

        <ProgressBar
          progress={error ? 100 : progress}
          variant={error ? 'error' : progress >= 100 ? 'success' : 'gradient'}
          size="lg"
        />

        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const Icon = stepIcons[step.id];
            const isLast = index === STEPS.length - 1;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-all',
                  stepStatus === 'active' && 'bg-primary/5 border border-primary/20',
                  stepStatus === 'complete' && 'opacity-60',
                  stepStatus === 'error' && 'bg-error/5 border border-error/20'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  stepStatus === 'complete' && 'bg-success/10',
                  stepStatus === 'active' && 'bg-primary/10',
                  stepStatus === 'error' && 'bg-error/10',
                  stepStatus === 'pending' && 'bg-background-secondary'
                )}>
                  {stepStatus === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : stepStatus === 'active' ? (
                    <Icon className={cn('w-5 h-5 text-primary', step.id === 'ai' && 'animate-spin')} />
                  ) : stepStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-error" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    stepStatus === 'active' ? 'text-primary' : 'text-text-primary'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {step.description}
                  </p>
                </div>

                {stepStatus === 'active' && !error && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-primary font-medium"
                  >
                    {Math.round(progress)}%
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {error && (
          <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error">Analysis Error</p>
                <p className="text-sm text-text-secondary mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UploadProgress;