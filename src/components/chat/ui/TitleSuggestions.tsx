import React from 'react';

interface TitleSuggestionsProps {
  titles: string[];
  onSelect: (title: string) => void;
}

export const TitleSuggestions: React.FC<TitleSuggestionsProps> = ({ titles, onSelect }) => {
  if (!titles?.length) {
    return (
      <div className="text-sm text-gray-600 mt-4">
        No title suggestions available. Please try again or enter your own title.
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="text-sm font-medium text-gray-700 mb-4">
        Click a title to select it, or type your own below:
      </div>
      <div className="space-y-2">
        {titles.map((title, index) => (
          <button
            key={index}
            onClick={() => onSelect(title)}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 group"
          >
            <div className="flex items-start">
              <span className="inline-block w-6 text-gray-400 group-hover:text-blue-500 font-medium">
                {index + 1}.
              </span>
              <span className="flex-1 text-gray-800 group-hover:text-blue-700">
                {title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};