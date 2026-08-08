import React from 'react';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';

const ProgressBar = ({
  progress,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  className,
}) => {
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-success',
    gradient: 'bg-gradient-to-r from-primary via-secondary to-accent',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-background-secondary rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          className={cn('h-full rounded-full', variants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-text-muted">{Math.round(progress)}%</span>
          <span className="text-xs text-text-muted">
            {progress >= 100 ? 'Complete' : 'Processing...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;