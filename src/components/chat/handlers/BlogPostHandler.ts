import { BaseContentHandler } from './ContentHandler';
import { defaultPrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class BlogPostHandler extends BaseContentHandler {
  constructor() {
    super('Blog Post');
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 10,
          error: 'Please provide a more detailed topic description'
        };
      case 'keywords':
        const keywords = input.split(',').map(k => k.trim()).filter(Boolean);
        return {
          isValid: keywords.length > 0 && keywords.length <= 10,
          error: keywords.length > 10 ? 'Maximum 10 keywords allowed' : 'Please enter at least one keyword'
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
          await generateTitleSuggestions();
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