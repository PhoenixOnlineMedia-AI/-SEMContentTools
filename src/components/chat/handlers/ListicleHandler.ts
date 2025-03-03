import { BaseContentHandler } from './ContentHandler';
import { contentTypePrompts, defaultPrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class ListicleHandler extends BaseContentHandler {
  constructor() {
    super('Listicle');
  }

  getPrompt(step: Step): ChatPrompt {
    // If it's the topic step, use the Listicle-specific prompt
    if (step === 'topic') {
      return contentTypePrompts['Listicle'];
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
        text: 'Choose a title for your listicle:',
        examples: [
          'Example: 10 Essential Tools Every Digital Marketer Needs',
          'Example: 7 Proven Strategies to Boost Your Website Conversion Rate',
          'Example: 15 Time-Saving Hacks for Busy Professionals'
        ]
      };
    }

    if (step === 'outline') {
      return {
        ...basePrompt,
        text: 'Review and customize your listicle outline:',
        examples: [
          'Tip: Each H2 will be a numbered list item',
          'Tip: Aim for at least 5-10 list items for a comprehensive listicle',
          'Tip: Consider adding a brief introduction and conclusion'
        ],
        tip: 'Each H2 section will be a numbered item in your list. Make sure you have enough list items for a comprehensive listicle.'
      };
    }

    return basePrompt;
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 10,
          error: 'Please provide a more detailed topic description for your listicle'
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
          error: 'Please provide a more descriptive title for your listicle'
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
          await generateTitleSuggestions({ contentType: 'Listicle' });
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
          // Pass metadata to indicate this is a listicle for proper formatting
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