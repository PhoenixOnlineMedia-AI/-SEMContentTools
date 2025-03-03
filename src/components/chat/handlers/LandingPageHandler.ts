import { ContentHandler } from './ContentHandler';
import { defaultPrompts, contentTypePrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class LandingPageHandler implements ContentHandler {
  getPrompt(step: Step): ChatPrompt {
    // Use landing page specific prompt for the topic step
    if (step === 'topic' && contentTypePrompts['Landing Page']) {
      return contentTypePrompts['Landing Page'];
    }
    
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
          isValid: input.length >= 10,
          error: 'Please provide more details about your landing page offer'
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