import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useContentStore } from '../../lib/store';
import { contentTypeConfigs } from './configs/contentTypes';
import { defaultPrompts } from './configs/prompts';
import { UsageIndicator } from './ui/UsageIndicator';
import { ContentTypeCard } from './ui/ContentTypeCard';
import { StepContainer } from './ui/StepContainer';
import { TitleSuggestions } from './ui/TitleSuggestions';
import { KeywordSelector } from './ui/KeywordSelector';
import { PlatformSelector } from './ui/PlatformSelector';
import { OutlineDisplay } from './ui/OutlineDisplay';
import { BlogPostHandler } from './handlers/BlogPostHandler';
import type { ContentHandler } from './handlers/ContentHandler';
import type { Platform } from '../../lib/deepseek';
import { HandlerFactory } from './handlers/HandlerFactory';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
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
    generateOutline,
    generateDraftContent
  } = store;

  // Test notification on component mount
  useEffect(() => {
    console.log('Testing notification system...');
    setActiveNotification('Testing notification system...');
    
    // Hide after 5 seconds
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to show a notification
  const showNotification = (message: string) => {
    console.log('Showing notification:', message);
    
    // Clear any existing timer
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    
    // Show the notification
    setActiveNotification(message);
  };

  // Function to hide a notification
  const hideNotification = () => {
    console.log('Hiding notification');
    
    // Clear any existing timer
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    
    // Hide the notification after a delay
    notificationTimerRef.current = setTimeout(() => {
      console.log('Actually hiding notification now');
      setActiveNotification(null);
      notificationTimerRef.current = null;
    }, 1500);
  };

  // Monitor loading state changes
  useEffect(() => {
    console.log('isLoading changed:', isLoading, 'step:', step);
    
    if (isLoading) {
      // Show appropriate notification based on current step
      if (step === 'topic') {
        showNotification('Generating title suggestions...');
      } else if (step === 'keywords') {
        showNotification('Generating LSI keywords...');
      } else if (step === 'lsi') {
        showNotification('Generating outline...');
      } else if (step === 'outline') {
        showNotification('Generating content...');
      }
    } else if (!isLoading && activeNotification) {
      // Only hide notification if it's been visible for at least 1 second
      const minDisplayTime = 1000; // 1 second
      setTimeout(() => {
        hideNotification();
      }, minDisplayTime);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, step]);

  // Get the appropriate handler for the current content type
  const getHandler = (): ContentHandler => {
    if (!contentType) {
      return new BlogPostHandler(); // Use BlogPostHandler as default if no content type selected
    }
    return HandlerFactory.getHandler(contentType, platform);
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

      // Show notification based on current step
      if (step === 'topic') {
        showNotification('Generating title suggestions...');
      } else if (step === 'keywords') {
        showNotification('Generating LSI keywords...');
      }

      await handler.processInput(step, input, store);
      setInput('');
      setError(null);
      
      // Hide notification after processing is complete
      setTimeout(() => {
        hideNotification();
      }, 1000);
    } catch (error: any) {
      console.error('Error in chat flow:', error);
      setError(error.message || 'An error occurred. Please try again.');
      hideNotification();
    }
  };

  const handlePlatformSelect = async (selectedPlatform: string) => {
    setPlatform(selectedPlatform as Platform);
    setStep('topic');
  };

  const handleTitleSelect = (selectedTitle: string) => {
    setTitle(selectedTitle);
    setStep('keywords');
  };

  const handleGenerateOutline = async () => {
    try {
      setError(null);
      showNotification('Generating outline...');
      await generateOutline();
      setStep('outline');
      setTimeout(() => {
        hideNotification();
      }, 1000);
    } catch (error: any) {
      console.error('Error generating outline:', error);
      setError(error.message || 'Failed to generate outline');
      hideNotification();
    }
  };

  const handleGenerateContent = async () => {
    try {
      showNotification('Generating content...');
      await generateDraftContent();
      setStep('content');
      setTimeout(() => {
        hideNotification();
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to generate content');
      hideNotification();
    }
  };

  const prompt = handler.getPrompt(step);

  return (
    <div className="flex flex-col h-full">
      {/* Notification banner */}
      {activeNotification && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 shadow-lg flex items-center justify-center z-[9999] border-b-2 border-blue-700" style={{ pointerEvents: 'none' }}>
          <div className="mr-3 animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          <span className="font-medium text-lg">{activeNotification}</span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
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
              maxSelections={10}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto animate-fade-in">
            {contentTypeConfigs.map((config) => (
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