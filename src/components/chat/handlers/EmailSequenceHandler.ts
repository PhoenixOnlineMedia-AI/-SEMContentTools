import { ContentHandler } from './ContentHandler';
import { defaultPrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

export class EmailSequenceHandler implements ContentHandler {
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
          isValid: input.length >= 10,
          error: 'Please provide a clear sequence purpose'
        };
      case 'email-count':
        const count = parseInt(input);
        return {
          isValid: !isNaN(count) && count >= 1 && count <= 10,
          error: 'Please enter a number between 1 and 10'
        };
      case 'target-audience':
        return {
          isValid: input.length >= 15,
          error: 'Please be more specific about your audience'
        };
      default:
        return { isValid: true };
    }
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setTopic,
      setEmailCount,
      setTargetAudience,
      generateTitleSuggestions,
      setStep,
      setError
    } = store;

    try {
      switch (step) {
        case 'topic':
          setTopic(input);
          setStep('email-count');
          break;

        case 'email-count':
          const count = parseInt(input);
          setEmailCount(count);
          setStep('target-audience');
          break;

        case 'target-audience':
          setTargetAudience(input);
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