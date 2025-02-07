import { ContentHandler } from './ContentHandler';
import { VIDEO_LIMITS } from '../configs/platforms';
import type { Step, ContentState } from '../../../lib/store';
import type { Platform } from '../../../lib/deepseek';
import type { ChatPrompt } from '../configs/prompts';
import { defaultPrompts, platformPrompts, contentTypePrompts } from '../configs/prompts';

export class VideoScriptHandler implements ContentHandler {
  constructor(private _platform: string) {}

  getPrompt(step: Step): ChatPrompt {
    if (step === 'platform') {
      return {
        text: 'Select the platform for your video script:',
        examples: [
          'YouTube: Longer format, detailed content (3-15 minutes)',
          'TikTok: Short, engaging clips (30-180 seconds)',
          'Explainer: Product or service demonstrations (1-5 minutes)'
        ]
      };
    }

    if (step === 'topic' && this._platform && platformPrompts[this._platform as Platform]) {
      return platformPrompts[this._platform as Platform];
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

  private get platform(): string {
    return this._platform;
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 10,
          error: 'Please provide a more detailed video topic description'
        };
      default:
        return { isValid: true };
    }
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setStep,
      setError
    } = store;

    try {
      switch (step) {
        case 'platform':
          store.setPlatform(input as Platform);
          setStep('topic');
          break;
        case 'topic':
          store.setTopic(input);
          await store.generateTitleSuggestions();
          setStep('title');
          break;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred processing your input');
      throw error;
    }
  }
} 