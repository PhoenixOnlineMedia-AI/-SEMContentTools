import type { ChatPrompt } from '../configs/prompts';
import { defaultPrompts, contentTypePrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';

export interface ContentHandler {
  getPrompt(step: Step): ChatPrompt;
  validateInput(step: Step, input: string): { isValid: boolean; error?: string };
  processInput(step: Step, input: string, store: ContentState): Promise<void>;
}

export class BaseContentHandler implements ContentHandler {
  constructor(protected contentType: string = '') {}

  getPrompt(step: Step): ChatPrompt {
    // If it's the first step after content type selection, use content type specific prompt
    if (step === 'topic' && this.contentType && contentTypePrompts[this.contentType]) {
      return contentTypePrompts[this.contentType];
    }
    
    // Otherwise use default prompts
    return defaultPrompts[step] || {
      text: '',
      examples: []
    };
  }

  validateInput(_step: Step, _input: string): { isValid: boolean; error?: string } {
    return { isValid: true };
  }

  async processInput(_step: Step, _input: string, _store: ContentState): Promise<void> {
    return Promise.resolve();
  }
}