import React from 'react';
import type { ContentTypeConfig } from '../configs/contentTypes';

interface ContentTypeCardProps {
  config: ContentTypeConfig;
  onClick: () => void;
}

export const ContentTypeCard: React.FC<ContentTypeCardProps> = React.memo(({ config, onClick }) => {
  const { type, icon: Icon, description, color } = config;

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left space-y-3 border border-gray-100 hover:border-${color}-500 bg-white group`}
    >
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className={`text-sm font-medium text-gray-900 group-hover:text-${color}-600 truncate`}>
          {type}
        </h3>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2">
        {description}
      </p>
    </button>
  );
});

ContentTypeCard.displayName = 'ContentTypeCard';