import React from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';

const FilterChips = ({
  filters,
  activeFilters,
  onToggle,
  onClear,
  className,
}) => {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter) => {
        const isActive = activeFilters.includes(filter.value);
        return (
          <button
            key={filter.value}
            onClick={() => onToggle(filter.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-background-secondary text-text-secondary border border-border hover:border-border-light'
            )}
          >
            {filter.icon}
            {filter.label}
            {isActive && <X className="w-3 h-3" />}
          </button>
        );
      })}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterChips;