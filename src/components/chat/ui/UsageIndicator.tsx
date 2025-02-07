import React from 'react';
import { format } from 'date-fns';

interface UsageInfo {
  contentCount: number;
  limit: number;
  periodEnd: string;
}

interface UsageIndicatorProps {
  usageInfo: UsageInfo | null;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ usageInfo }) => {
  if (!usageInfo) return null;

  const { contentCount, limit, periodEnd } = usageInfo;
  const percentage = (contentCount / limit) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Monthly Usage
        </span>
        <span className="text-sm text-gray-500">
          Resets {format(new Date(periodEnd), 'MMM d, yyyy')}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            percentage >= 90 ? 'bg-red-500' : 
            percentage >= 75 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {contentCount} of {limit} pieces used
      </div>
    </div>
  );
};