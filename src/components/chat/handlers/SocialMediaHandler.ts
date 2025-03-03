import { ContentHandler } from './ContentHandler';
import { PLATFORM_LIMITS } from '../configs/platforms';
import { formatHashtags } from '../../../lib/hashtagUtils';
import type { Step, ContentState } from '../../../lib/store';
import type { Platform } from '../../../lib/deepseek';
import type { ChatPrompt } from '../configs/prompts';
import { defaultPrompts, platformPrompts } from '../configs/prompts';

export class SocialMediaHandler implements ContentHandler {
  constructor(private _platform: string) {}

  getPrompt(step: Step): ChatPrompt {
    if (step === 'platform') {
      return {
        text: 'Select the social media platform for your content:',
        examples: [
          'Choose the platform that best fits your audience',
          'Each platform has specific content limits and best practices',
          'Platform selection will affect content style and format'
        ]
      };
    }

    // Use platform-specific prompts for the topic and title steps
    if (step === 'topic' && this._platform) {
      const platformPrompt = platformPrompts[this._platform as Platform];
      if (platformPrompt) {
        return platformPrompt;
      }
    }

    if (step === 'title') {
      return {
        text: `Create your ${this._platform} post caption:`,
        examples: [
          'Start with a hook or engaging question',
          'Include relevant emojis strategically',
          'Add a clear call-to-action',
          `Note: Maximum ${PLATFORM_LIMITS[this._platform]?.chars || 280} characters`
        ]
      };
    }

    if (step === 'hashtags') {
      return {
        text: `Enter your ${this._platform} hashtags (separated by commas):`,
        examples: [
          'Example: #marketing, #socialmedia, #business',
          'Example: #tech, #innovation, #startup',
          `Note: Maximum ${PLATFORM_LIMITS[this._platform]?.hashtags || 5} hashtags allowed`,
          'Tip: Mix trending and niche hashtags for better reach'
        ]
      };
    }

    if (step === 'lsi') {
      return {
        text: 'Select additional hashtags to enhance your post:',
        examples: [
          'Choose hashtags that complement your main ones',
          'Mix popular and niche hashtags for better reach',
          'Consider trending hashtags in your industry',
          `Maximum ${PLATFORM_LIMITS[this._platform]?.hashtags || 5} total hashtags`
        ]
      };
    }

    if (step === 'outline') {
      return {
        text: `Structure your ${this._platform} post:`,
        examples: [
          'Hook/Opening line',
          'Main message or value proposition',
          'Supporting points or details',
          'Call-to-action',
          'Hashtag placement'
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

  private get platform(): string {
    return this._platform;
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 5,
          error: 'Please provide a more detailed topic description'
        };
      case 'title':
        const charLimit = PLATFORM_LIMITS[this._platform]?.chars || 280;
        return {
          isValid: input.length <= charLimit,
          error: `Caption exceeds ${charLimit} character limit for ${this._platform}`
        };
      case 'hashtags':
        const hashtags = input.split(',').map(h => h.trim()).filter(Boolean);
        const maxHashtags = PLATFORM_LIMITS[this.platform]?.hashtags || 5;
        return {
          isValid: hashtags.length <= maxHashtags,
          error: `Maximum ${maxHashtags} hashtags allowed for ${this.platform}`
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
      setKeywords,
      generateLSIKeywords,
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
          await store.generateTitleSuggestions();
          setStep('title');
          break;

        case 'title':
          setTitle(input);
          setStep('hashtags');
          break;

        case 'hashtags':
          const hashtagList = input.split(',')
            .map(h => h.trim())
            .filter(Boolean)
            .map(h => h.startsWith('#') ? h : `#${h}`);
          
          setKeywords(hashtagList);
          await generateLSIKeywords(hashtagList);
          setStep('lsi');
          break;

        case 'lsi':
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