import React from 'react';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({
  children,
  className,
  hover = false,
  glow = false,
  padding = 'normal',
  onClick,
  ...props
}, ref) => {
  const paddings = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-[#0F172A]/95 border border-white/10 rounded-2xl transition-all duration-300 shadow-xl',
        paddings[padding],
        hover && 'hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer',
        glow && 'shadow-glow hover:shadow-glow-lg',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className }) => (
  <p className={cn('text-sm text-text-secondary mt-1', className)}>
    {children}
  </p>
);

export const CardContent = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-border', className)}>
    {children}
  </div>
);

export default Card;