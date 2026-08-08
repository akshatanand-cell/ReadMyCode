import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-error hover:bg-error-hover text-white font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50',
    success: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-success hover:bg-success-hover text-white font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      className={cn(
        variants[variant],
        size !== 'md' && variant !== 'primary' && variant !== 'secondary' && variant !== 'ghost' ? sizes[size] : '',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;