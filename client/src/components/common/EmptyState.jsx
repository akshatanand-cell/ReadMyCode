import React from 'react';
import { cn } from '@/utils/helpers';
import { FileSearch, FolderOpen, Inbox, Search, Upload } from 'lucide-react';

const iconMap = {
  search: Search,
  upload: Upload,
  inbox: Inbox,
  folder: FolderOpen,
  file: FileSearch,
};

const EmptyState = ({
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  icon = 'inbox',
  action,
  className,
}) => {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;