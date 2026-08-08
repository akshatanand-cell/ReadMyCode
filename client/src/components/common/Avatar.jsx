import React from 'react';
import { cn } from '@/utils/helpers';
import { User } from 'lucide-react';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  fallbackClassName,
}) => {
  const [error, setError] = React.useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const bgColors = [
    'bg-primary/20 text-primary',
    'bg-secondary/20 text-secondary',
    'bg-accent/20 text-accent',
    'bg-success/20 text-success',
    'bg-warning/20 text-warning',
  ];

  const bgColor = bgColors[name?.length % bgColors.length] || bgColors[0];

  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn('rounded-full object-cover', sizes[size], className)}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        sizes[size],
        bgColor,
        fallbackClassName
      )}
    >
      {initials}
    </div>
  );
};

export default Avatar;