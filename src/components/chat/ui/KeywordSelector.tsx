import React, { useState } from 'react';
import { Check, Wand2 } from 'lucide-react';

interface KeywordSelectorProps {
  keywords: string[];
  selectedKeywords: string[];
  onSelect: (keyword: string) => void;
  onDeselect: (keyword: string) => void;
  maxSelections?: number;
  onGenerateOutline: () => Promise<void>;
}

export const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  keywords,
  selectedKeywords,
  onSelect,
  onDeselect,
  maxSelections = 5,
  onGenerateOutline
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggle = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      onDeselect(keyword);
    } else if (selectedKeywords.length < maxSelections) {
      onSelect(keyword);
    }
  };

  const handleGenerateOutline = async () => {
    if (selectedKeywords.length === 0) return;
    
    try {
      setIsGenerating(true);
      await onGenerateOutline();
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!keywords?.length) {
    return (
      <div className="text-sm text-gray-600 mt-4">
        No keywords available. Please try again.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-700">
          Select keywords to optimize your content:
        </div>
        <div className="text-sm text-gray-500">
          Selected: {selectedKeywords.length}/{maxSelections}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => {
          const isSelected = selectedKeywords.includes(keyword);
          return (
            <button
              key={keyword}
              onClick={() => handleToggle(keyword)}
              disabled={!isSelected && selectedKeywords.length >= maxSelections}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : selectedKeywords.length >= maxSelections
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 mr-1" />}
              {keyword}
            </button>
          );
        })}
      </div>
      {selectedKeywords.length >= maxSelections && (
        <p className="text-sm text-amber-600 mt-2">
          Maximum {maxSelections} keywords can be selected
        </p>
      )}
      {selectedKeywords.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Keywords:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerateOutline}
            disabled={isGenerating || selectedKeywords.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Outline</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};