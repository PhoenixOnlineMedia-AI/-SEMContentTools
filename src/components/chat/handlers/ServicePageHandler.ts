import { ContentHandler } from './ContentHandler';
import { defaultPrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class ServicePageHandler implements ContentHandler {
  getPrompt(step: Step): ChatPrompt {
    const prompt = defaultPrompts[step];
    if (!prompt) {
      return {
        text: '',
        examples: []
      };
    }
    return prompt;
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 5,
          error: 'Please enter a valid service description'
        };
      case 'service-location':
        const locationRegex = /^[A-Za-z\s]+(Metro\s+Area|,\s*[A-Z]{2})$/;
        return {
          isValid: locationRegex.test(input),
          error: 'Please use format: City, ST (e.g., Austin, TX) or Metro Area (e.g., Phoenix Metro Area)'
        };
      case 'local-keywords':
        const keywords = input.split(',').map(k => k.trim()).filter(Boolean);
        return {
          isValid: keywords.length > 0,
          error: 'Please enter at least one local keyword'
        };
      default:
        return { isValid: true };
    }
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setTopic,
      setServiceLocation,
      setLocalKeywords,
      generateTitleSuggestions,
      setStep,
      setError
    } = store;

    try {
      switch (step) {
        case 'topic':
          setTopic(input);
          setStep('location-toggle');
          break;

        case 'service-location':
          setServiceLocation(input);
          setStep('local-keywords');
          break;

        case 'local-keywords':
          const localKeywordsList = input.split(',').map(k => k.trim()).filter(Boolean);
          setLocalKeywords(localKeywordsList);
          await generateTitleSuggestions();
          setStep('title');
          break;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred processing your input');
      throw error;
    }
  }
}