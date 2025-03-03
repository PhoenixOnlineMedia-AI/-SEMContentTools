import { BaseContentHandler } from './ContentHandler';
import { contentTypePrompts, defaultPrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class ResourceGuideHandler extends BaseContentHandler {
  constructor() {
    super('Resource Guide');
  }

  getPrompt(step: Step): ChatPrompt {
    // If it's the topic step, use the Resource Guide-specific prompt
    if (step === 'topic') {
      return contentTypePrompts['Resource Guide'];
    }
    
    // For other steps, use default prompts with some customization
    const basePrompt = defaultPrompts[step] || {
      text: '',
      examples: []
    };

    // Customize prompts based on step
    if (step === 'title') {
      return {
        ...basePrompt,
        text: 'Choose a title for your resource guide:',
        examples: [
          'Example: The Ultimate Guide to Content Marketing in 2024',
          'Example: Complete Resource Collection for Learning JavaScript',
          'Example: Comprehensive Guide to Sustainable Living'
        ]
      };
    }

    if (step === 'outline') {
      return {
        ...basePrompt,
        text: 'Review and customize your resource guide outline:',
        examples: [
          'Tip: Include sections for different types of resources',
          'Tip: Add explanations of why each resource is valuable',
          'Tip: Consider organizing resources by skill level or use case'
        ],
        tip: 'A good resource guide should have clear sections with actionable resources and recommendations in each section.'
      };
    }

    return basePrompt;
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 10,
          error: 'Please provide a more detailed topic description for your resource guide'
        };
      case 'keywords':
        const keywords = input.split(',').map(k => k.trim()).filter(Boolean);
        return {
          isValid: keywords.length > 0 && keywords.length <= 10,
          error: keywords.length > 10 ? 'Maximum 10 keywords allowed' : 'Please enter at least one keyword'
        };
      case 'title':
        return {
          isValid: input.length >= 5,
          error: 'Please provide a more descriptive title for your resource guide'
        };
      default:
        return { isValid: true };
    }
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setTopic,
      setTitle,
      setKeywords,
      generateTitleSuggestions,
      generateLSIKeywords,
      generateOutline,
      setStep,
      setError
    } = store;

    try {
      switch (step) {
        case 'topic':
          setTopic(input);
          await generateTitleSuggestions({ contentType: 'Resource Guide' });
          setStep('title');
          break;

        case 'title':
          setTitle(input);
          setStep('keywords');
          break;

        case 'keywords':
          const keywordList = input.split(',').map(k => k.trim()).filter(Boolean);
          setKeywords(keywordList);
          await generateLSIKeywords(keywordList);
          setStep('lsi');
          break;

        case 'lsi':
          // After LSI keywords are selected, generate the outline
          // Pass metadata to indicate this is a resource guide for proper formatting
          await generateOutline();
          setStep('outline');
          break;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred processing your input');
      throw error;
    }
  }
} 