import React, { useState } from 'react';
import { cn } from '@/utils/helpers';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-card',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-card',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-card',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-card',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn('absolute z-50 px-3 py-2 bg-card border border-border rounded-lg text-xs text-text-secondary shadow-lg whitespace-nowrap', positions[position], className)}>
          {content}
          <div className={cn('absolute w-2 h-2 border-4 border-transparent', arrows[position])} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;