import React, { useState, useEffect, useRef } from 'react';
import { Send, Wand2, GripVertical, Plus, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useContentStore } from '../lib/store';
import { contentTypeCards } from './chat/configs/contentTypes';
import { HandlerFactory } from './chat/handlers/HandlerFactory';
import type { ContentType, OutlineItem } from '../lib/store';
import { format } from 'date-fns';
import type { ContentTypeConfig } from './chat/configs/contentTypes';
import type { Platform } from '../lib/deepseek';
import { BlogPostHandler } from './chat/handlers/BlogPostHandler';
import type { ContentHandler } from './chat/handlers/ContentHandler';
import { PlatformSelector } from './chat/ui/PlatformSelector';

interface UsageInfo {
  contentCount: number;
  limit: number;
  periodEnd: string;
}

interface SortableItemProps {
  id: string;
  item: OutlineItem;
  index: number;
  onUpdate: (index: number, updates: Partial<OutlineItem>) => void;
  onDelete: (index: number) => void;
  onAddListItem?: (index: number) => void;
  onDeleteListItem?: (itemIndex: number, listIndex: number) => void;
}

const SortableItem = ({ id, item, index, onUpdate, onDelete, onAddListItem, onDeleteListItem }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
        <div
          {...attributes}
          {...listeners}
          className="mt-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex-1">
          {item.type === 'h1' && (
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate(index, { content: e.target.value })}
              className="w-full text-lg font-bold p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Main Section Title"
            />
          )}
          
          {item.type === 'h2' && (
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate(index, { content: e.target.value })}
              className="w-full text-md font-semibold p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Subsection Title"
            />
          )}
          
          {item.type === 'list' && (
            <div className="space-y-2">
              {item.items?.map((listItem, listIndex) => (
                <div key={listIndex} className="flex items-center space-x-2">
                  <span className="text-gray-400">•</span>
                  <input
                    type="text"
                    value={listItem}
                    onChange={(e) => {
                      const newItems = [...(item.items || [])];
                      newItems[listIndex] = e.target.value;
                      onUpdate(index, { items: newItems });
                    }}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="List item"
                  />
                  <button
                    onClick={() => onDeleteListItem?.(index, listIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddListItem?.(index)}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add item</span>
              </button>
            </div>
          )}
          
          {item.type === 'cta' && (
            <input
              type="text"
              value={item.content}
              onChange={(e) => onUpdate(index, { content: e.target.value })}
              className="w-full p-2 border-2 border-purple-200 rounded focus:ring-2 focus:ring-purple-500 bg-purple-50"
              placeholder="Call to Action"
            />
          )}
        </div>
        
        <button
          onClick={() => onDelete(index)}
          className="mt-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const UsageIndicator = ({ usageInfo }: { usageInfo: UsageInfo | null }) => {
  if (!usageInfo) return null;

  const { contentCount, limit, periodEnd } = usageInfo;
  const percentage = (contentCount / limit) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Content Credits
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
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{contentCount}</span> of <span className="font-medium">{limit}</span> pieces used
        </div>
        <div className="text-sm font-medium">
          {limit - contentCount} remaining
        </div>
      </div>
    </div>
  );
};

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
    keywords,
    lsiKeywords,
    selectedKeywords,
    outline,
    isLoading,
    error,
    setStep,
    setContentType,
    setTitle,
    setSelectedKeywords,
    setOutline,
    generateOutline,
    generateDraftContent,
    usageInfo,
    checkUsageLimit,
    setError
  } = store;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (checkUsageLimit) {
      checkUsageLimit();
    }
  }, [checkUsageLimit]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    try {
      const handler = HandlerFactory.getHandler(contentType, platform);
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

  const handleContentTypeSelect = (type: ContentType) => {
    HandlerFactory.clearHandlers();
    setContentType(type);
    // Check if the type is one of the platform-specific content types
    if (type === 'Social Media Post' || type === 'Video Script') {
      setStep('platform');
    }
  };

  const handlePlatformSelect = (selectedPlatform: Platform) => {
    store.setPlatform(selectedPlatform);
    setStep('topic');
  };

  const handleKeywordSelect = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      const maxKeywords = 5;
      
      if (selectedKeywords.length < maxKeywords) {
        setSelectedKeywords([...selectedKeywords, keyword]);
      }
    }
  };

  const handleGenerateOutline = async () => {
    if (selectedKeywords.length === 0) {
      setError('Please select at least one keyword');
      return;
    }

    try {
      showNotification('Generating outline...');
      await generateOutline();
      setStep('outline');
      setTimeout(() => {
        hideNotification();
      }, 1000);
    } catch (error: any) {
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

  const getCurrentPrompt = () => {
    if (step === 'type') {
      return {
        text: 'What type of content would you like to create?',
        examples: []
      };
    }

    const handler = HandlerFactory.getHandler(contentType, platform);
    return handler.getPrompt(step);
  };

  const prompt = getCurrentPrompt();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = outline.findIndex((item) => item.id === active.id);
      const newIndex = outline.findIndex((item) => item.id === over.id);
      
      setOutline(arrayMove(outline, oldIndex, newIndex));
    }
  };

  // Get the current handler and prompt
  const currentHandler = contentType 
    ? HandlerFactory.getHandler(contentType, platform) 
    : null;
  const currentPrompt = currentHandler?.getPrompt(step);

  // Get the appropriate handler for the current content type
  const getHandler = (): ContentHandler => {
    if (!contentType) {
      return new BlogPostHandler(); // Use BlogPostHandler as default if no content type selected
    }
    return HandlerFactory.getHandler(contentType, platform);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Notification banner */}
      {activeNotification && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-6 py-4 shadow-lg flex items-center justify-center z-[9999] border-b-2 border-blue-700" style={{ pointerEvents: 'none' }}>
          <div className="mr-3 animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          <span className="font-medium text-lg">{activeNotification}</span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <UsageIndicator usageInfo={usageInfo} />
        
        {/* Current Step Display */}
        <div 
          className="bg-white rounded-lg p-6 shadow-lg transform transition-all duration-500 ease-in-out animate-fade-in-down"
          key={step}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {prompt.text}
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

          {/* LSI Keyword Selection */}
          {step === 'lsi' && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  Selected: {selectedKeywords.length}/5
                </div>
              </div>

              {/* Original Keywords Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Original Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <button
                      key={`original-${keyword}`}
                      onClick={() => handleKeywordSelect(keyword)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                        selectedKeywords.includes(keyword)
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* LSI Keywords Section */}
              {lsiKeywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested LSI Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {lsiKeywords.map((keyword) => (
                      <button
                        key={`lsi-${keyword}`}
                        onClick={() => handleKeywordSelect(keyword)}
                        disabled={selectedKeywords.length >= 5 && !selectedKeywords.includes(keyword)}
                        className={`px-3 py-1.5 rounded-full text-sm font-content-medium transition-colors duration-200 ${
                          selectedKeywords.includes(keyword)
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : selectedKeywords.length >= 5
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedKeywords.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleGenerateOutline}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Outline</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Outline Display */}
          {step === 'outline' && outline.length > 0 && (
            <div className="mt-4 space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={outline.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {outline.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        item={item}
                        index={index}
                        onUpdate={(index, updates) => {
                          const newOutline = [...outline];
                          newOutline[index] = { ...newOutline[index], ...updates };
                          setOutline(newOutline);
                        }}
                        onDelete={(index) => {
                          const newOutline = [...outline];
                          newOutline.splice(index, 1);
                          setOutline(newOutline);
                        }}
                        onAddListItem={(index) => {
                          const newOutline = [...outline];
                          const newItems = [...(newOutline[index].items || []), ''];
                          newOutline[index] = { ...newOutline[index], items: newItems };
                          setOutline(newOutline);
                        }}
                        onDeleteListItem={(itemIndex, listIndex) => {
                          const newOutline = [...outline];
                          const newItems = [...(newOutline[itemIndex].items || [])];
                          newItems.splice(listIndex, 1);
                          newOutline[itemIndex] = { ...newOutline[itemIndex], items: newItems };
                          setOutline(newOutline);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const newSection: OutlineItem = {
                      id: crypto.randomUUID(),
                      type: 'h1',
                      content: '',
                      items: []
                    };
                    setOutline([...outline, newSection]);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
                
                <button
                  onClick={() => {
                    const newSubsection: OutlineItem = {
                      id: crypto.randomUUID(),
                      type: 'h2',
                      content: '',
                      items: []
                    };
                    setOutline([...outline, newSubsection]);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subsection</span>
                </button>
                
                <button
                  onClick={() => {
                    const newList: OutlineItem = {
                      id: crypto.randomUUID(),
                      type: 'list',
                      content: '',
                      items: ['']
                    };
                    setOutline([...outline, newList]);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add List</span>
                </button>
                
                <button
                  onClick={() => {
                    const newCTA: OutlineItem = {
                      id: crypto.randomUUID(),
                      type: 'cta',
                      content: '',
                      items: []
                    };
                    setOutline([...outline, newCTA]);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add CTA</span>
                </button>
                
                <button
                  onClick={handleGenerateContent}
                  className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Content</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Platform Selection */}
        {step === 'platform' && (
          <div className="mt-4">
            <PlatformSelector
              contentType={contentType}
              onSelect={handlePlatformSelect}
            />
          </div>
        )}

        {/* Content Type Selection */}
        {step === 'type' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contentTypeCards.map((config: ContentTypeConfig) => (
              <button
                key={config.type}
                onClick={() => handleContentTypeSelect(config.type)}
                className="p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-left space-y-3 border border-gray-200 hover:border-blue-500 bg-white group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-${config.color}-50 text-${config.color}-600 flex items-center justify-center`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {config.type}
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  {config.description}
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Examples:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {config.examples.map((example, index) => (
                      <li key={index} className="flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full bg-${config.color}-400 mr-2`} />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Title Suggestions */}
        {step === 'title' && titleSuggestions.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-4">
              Click a title to select it, or type your own below:
            </div>
            <div className="space-y-2">
              {titleSuggestions.map((title, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    try {
                      const handler = HandlerFactory.getHandler(contentType as ContentType, platform);
                      await handler.processInput('title', title, store);
                    } catch (error: any) {
                      console.error('Error processing title:', error);
                      setError(error.message || 'An error occurred. Please try again.');
                    }
                  }}
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
            placeholder={currentPrompt?.text || 'Type your message...'}
            disabled={isLoading || step === 'outline' || step === 'lsi' || step === 'type' || step === 'platform'}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            disabled={!input.trim() || isLoading || step === 'outline' || step === 'lsi' || step === 'type' || step === 'platform'}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}