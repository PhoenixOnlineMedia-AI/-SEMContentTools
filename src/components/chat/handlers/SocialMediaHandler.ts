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

    // Use platform-specific prompts for the topic step
    if (step === 'topic' && this._platform) {
      const platformPrompt = platformPrompts[this._platform as Platform];
      if (platformPrompt) {
        return platformPrompt;
      }
    }

    if (step === 'title') {
      return {
        text: `Enter your ${this._platform} post caption (supports emojis):`,
        examples: [
          'Tip: Start with a hook or engaging question',
          'Tip: Include a clear call-to-action',
          'Tip: Add relevant emojis sparingly',
          `Note: Maximum ${PLATFORM_LIMITS[this._platform]?.chars || 280} characters`
        ]
      };
    }

    // Use platform-specific hashtag prompts
    if (step === 'hashtags' && this._platform) {
      const platformPrompt = platformPrompts[this._platform as Platform];
      if (platformPrompt?.hashtags) {
        return platformPrompt.hashtags;
      }
      // Fallback to default hashtag prompt with platform-specific limits
      return {
        text: `Enter your hashtags for ${this._platform} (separated by commas):`,
        examples: [
          `Maximum ${PLATFORM_LIMITS[this._platform]?.hashtags || 5} hashtags allowed`,
          'Mix trending and niche hashtags for better reach',
          'Include relevant industry and brand hashtags',
          'Example: #YourBrand, #IndustryTrend, #SpecificCampaign'
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
        text: 'Review and customize your post structure:',
        examples: [
          `Platform: ${this._platform}`,
          'Tip: Add media references (e.g., [IMAGE 1: Product shot])',
          'Tip: Include CTA placement markers',
          'Tip: Arrange hashtags strategically'
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
      setTopic,
      setTitle,
      setKeywords,
      generateTitleSuggestions,
      generateLSIKeywords,
      generateOutline,
      generateDraftContent,
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
          setTopic(input);
          await generateTitleSuggestions();
          setStep('title');
          break;
        case 'title':
          setTitle(input);
          setStep('hashtags');
          break;
        case 'hashtags':
          // Format hashtags and handle LSI generation
          const hashtagList = input.split(',').map(h => h.trim()).filter(Boolean);
          const formattedHashtags = formatHashtags(hashtagList);
          setKeywords(formattedHashtags);
          // Generate LSI hashtags based on the initial hashtags
          await generateLSIKeywords(formattedHashtags);
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