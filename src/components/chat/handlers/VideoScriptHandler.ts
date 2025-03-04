import { ContentHandler } from './ContentHandler';
import { VIDEO_LIMITS } from '../configs/platforms';
import type { Step, ContentState } from '../../../lib/store';
import type { Platform, VideoPlatform } from '../../../lib/deepseek';
import type { ChatPrompt } from '../configs/prompts';
import { defaultPrompts, platformPrompts, contentTypePrompts } from '../configs/prompts';

export class VideoScriptHandler implements ContentHandler {
  constructor(private _platform: string) {}

  private get platform(): VideoPlatform {
    return this._platform as VideoPlatform;
  }

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

    if (step === 'topic' && this._platform) {
      const limits = VIDEO_LIMITS[this.platform];
      return {
        text: `What would you like to create a ${this.platform} video about?`,
        examples: [
          'Example: Step-by-step tutorial on using a product',
          'Example: Industry insights or expert tips',
          'Example: Behind-the-scenes look at your process',
          `Note: Optimal length for ${this.platform}: ${limits.minLength}-${limits.maxLength} minutes`
        ]
      };
    }

    if (step === 'title') {
      return {
        text: `Create a compelling title for your ${this.platform} video:`,
        examples: [
          'Example: "5 Game-Changing Tips for [Topic]"',
          'Example: "The Ultimate Guide to [Topic]"',
          'Example: "How to [Achieve Result] in [Time Frame]"',
          'Tip: Include keywords for better searchability'
        ]
      };
    }

    if (step === 'outline') {
      return {
        text: 'Structure your video script:',
        examples: [
          'Include an attention-grabbing hook',
          'Break down main points into sections',
          'Add timestamps for longer videos',
          'Include call-to-action prompts'
        ]
      };
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
          error: 'Please provide a more detailed video topic description'
        };
      case 'title':
        return {
          isValid: input.length >= 5 && input.length <= 100,
          error: 'Title should be between 5 and 100 characters'
        };
      default:
        return { isValid: true };
    }
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setStep,
      setError,
      setTopic,
      setTitle,
      generateTitleSuggestions,
      generateOutline,
      generateDraftContent
    } = store;

    try {
      switch (step) {
        case 'platform':
          store.setPlatform(input as Platform);
          setStep('topic');
          break;

        case 'topic':
          setTopic(input);
          await generateTitleSuggestions();
          setStep('title');
          break;

        case 'title':
          setTitle(input);
          await generateOutline();
          setStep('outline');
          break;

        case 'outline':
          await generateDraftContent();
          setStep('content');
          break;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred processing your input');
      throw error;
    }
  }
} 