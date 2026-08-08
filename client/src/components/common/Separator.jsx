import React from 'react';
import { cn } from '@/utils/helpers';

const Separator = ({ className, orientation = 'horizontal' }) => (
  <div
    className={cn(
      'bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
      className
    )}
  />
);

export default Separator;