import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 'md', className, text }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
      {text && <span className="text-sm text-text-secondary">{text}</span>}
    </div>
  );
};

export const FullPageSpinner = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-text-secondary animate-pulse">{text}</p>
    </div>
  </div>
);

export const InlineSpinner = ({ className }) => (
  <Loader2 className={cn('w-4 h-4 animate-spin text-primary', className)} />
);

export default Spinner;