import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useContentStore } from '../../lib/store';
import { contentTypeCards } from './configs/contentTypes';
import { defaultPrompts } from './configs/prompts';
import { UsageIndicator } from './ui/UsageIndicator';
import { ContentTypeCard } from './ui/ContentTypeCard';
import { StepContainer } from './ui/StepContainer';
import { TitleSuggestions } from './ui/TitleSuggestions';
import { KeywordSelector } from './ui/KeywordSelector';
import { PlatformSelector } from './ui/PlatformSelector';
import { OutlineDisplay } from './ui/OutlineDisplay';
import { ServicePageHandler } from './handlers/ServicePageHandler';
import { EmailSequenceHandler } from './handlers/EmailSequenceHandler';
import { SocialMediaHandler } from './handlers/SocialMediaHandler';
import { BlogPostHandler } from './handlers/BlogPostHandler';
import { VideoScriptHandler } from './handlers/VideoScriptHandler';
import type { ContentHandler } from './handlers/ContentHandler';
import type { ContentTypeConfig } from './configs/contentTypes';
import type { Platform } from '../../lib/deepseek';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const store = useContentStore();
  const {
    step,
    contentType,
    platform,
    titleSuggestions,
    lsiKeywords,
    selectedKeywords,
    outline,
    isLoading,
    error,
    setContentType,
    setPlatform,
    setTitle,
    setSelectedKeywords,
    setOutline,
    setStep,
    setError,
    usageInfo,
    checkUsageLimit,
    generateTitleSuggestions,
    generateOutline,
    generateDraftContent
  } = store;

  // Get the appropriate handler for the current content type
  const getHandler = (): ContentHandler => {
    switch (contentType) {
      case 'Service Page':
        return new ServicePageHandler();
      case 'Email Sequence':
        return new EmailSequenceHandler();
      case 'Social Media Post':
        return new SocialMediaHandler(platform);
      case 'Video Script':
        return new VideoScriptHandler(platform);
      case 'Blog Post':
        return new BlogPostHandler();
      default:
        return new BlogPostHandler(); // Use BlogPostHandler as default
    }
  };

  const handler = getHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      const validation = handler.validateInput(step, input);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
        return;
      }

      await handler.processInput(step, input, store);
      setInput('');
      setError(null);
    } catch (error: any) {
      console.error('Error in chat flow:', error);
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  const handlePlatformSelect = async (selectedPlatform: Platform) => {
    try {
      setPlatform(selectedPlatform);
      
      // Ensure we have the correct handler for the selected platform
      const updatedHandler = contentType === 'Social Media Post' 
        ? new SocialMediaHandler(selectedPlatform)
        : contentType === 'Video Script'
          ? new VideoScriptHandler(selectedPlatform)
          : getHandler();
      
      // Process the platform selection
      await updatedHandler.processInput('platform', selectedPlatform, store);
    } catch (error: any) {
      console.error('Error selecting platform:', error);
      setError(error.message || 'An error occurred selecting the platform');
    }
  };

  const handleTitleSelect = (selectedTitle: string) => {
    setTitle(selectedTitle);
    setStep('keywords');
  };

  const handleGenerateOutline = async () => {
    try {
      setError(null);
      await generateOutline();
      setStep('outline');
    } catch (error: any) {
      console.error('Error generating outline:', error);
      setError(error.message || 'Failed to generate outline');
    }
  };

  const handleGenerateContent = async () => {
    try {
      await generateDraftContent();
      setStep('content');
    } catch (error: any) {
      setError(error.message || 'Failed to generate content');
    }
  };

  const prompt = handler.getPrompt(step);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <UsageIndicator usageInfo={usageInfo} />
        
        <StepContainer step={step}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {prompt.text || defaultPrompts[step]?.text}
          </h3>
          {prompt.examples.length > 0 && (
            <div className="space-y-2 text-sm text-gray-600">
              {prompt.examples.map((example, index) => (
                <p key={index} className="leading-relaxed">
                  {example}
                </p>
              ))}
            </div>
          )}

          {/* Title Suggestions */}
          {step === 'title' && titleSuggestions && titleSuggestions.length > 0 && (
            <TitleSuggestions
              titles={titleSuggestions}
              onSelect={handleTitleSelect}
            />
          )}

          {/* LSI Keyword Selection */}
          {step === 'lsi' && lsiKeywords?.length > 0 && (
            <KeywordSelector
              keywords={lsiKeywords}
              selectedKeywords={selectedKeywords}
              onSelect={(keyword) => setSelectedKeywords([...selectedKeywords, keyword])}
              onDeselect={(keyword) => setSelectedKeywords(selectedKeywords.filter(k => k !== keyword))}
              maxSelections={contentType === 'Social Media Post' ? 5 : 10}
              onGenerateOutline={handleGenerateOutline}
            />
          )}

          {/* Platform Selection */}
          {step === 'platform' && (
            <PlatformSelector
              contentType={contentType}
              onSelect={handlePlatformSelect}
            />
          )}

          {/* Outline Display */}
          {step === 'outline' && outline && (
            <OutlineDisplay
              outline={outline}
              contentType={contentType}
              onOutlineChange={setOutline}
              onGenerateContent={handleGenerateContent}
              isLoading={isLoading}
            />
          )}
        </StepContainer>

        {/* Content Type Selection */}
        {step === 'type' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {contentTypeCards.map((config: ContentTypeConfig) => (
              <ContentTypeCard
                key={config.type}
                config={config}
                onClick={() => setContentType(config.type)}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder={step === 'title' ? 'Enter your own title or select one above' : 'Type your message...'}
            disabled={isLoading || step === 'outline' || step === 'lsi' || step === 'type' || step === 'platform' || step === 'location-toggle'}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            disabled={!input.trim() || isLoading || step === 'outline' || step === 'lsi' || step === 'type' || step === 'platform' || step === 'location-toggle'}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}