import { ContentHandler } from './ContentHandler';
import { defaultPrompts, contentTypePrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';

interface EmailSequenceMetadata {
  emailCount: number;
  companyName: string;
  targetAudience: string;
}

export class EmailSequenceHandler implements ContentHandler {
  getPrompt(step: Step): ChatPrompt {
    // Use email sequence specific prompt for the topic step
    if (step === 'topic' && contentTypePrompts['Email Sequence']) {
      return contentTypePrompts['Email Sequence'];
    }

    // Use specific prompts for email sequence steps
    switch (step) {
      case 'email-count':
        return {
          text: 'How many emails would you like in this sequence?',
          examples: [
            'Typically 3-7 emails work best',
            'More than 7 may overwhelm recipients',
            'Fewer than 3 might not build enough momentum',
            'Example: 5 (for a standard welcome series)',
            'Example: 3 (for an abandoned cart sequence)',
            'Example: 7 (for a product launch campaign)'
          ]
        };
      case 'company-name':
        return {
          text: 'What is your company or brand name?',
          examples: [
            'Example: TechStart Solutions',
            'Example: Green Earth Organics',
            'Example: Elite Fitness Club',
            'Tip: This will be used in your email content and signatures'
          ]
        };
      case 'target-audience':
        return {
          text: 'Who is the target audience for this email sequence?',
          examples: [
            'Example: New subscribers who signed up for our newsletter',
            'Example: E-commerce customers who abandoned their cart',
            'Example: Trial users who haven\'t converted to paid',
            'Example: Past customers who haven\'t purchased in 3 months',
            'Tip: Be specific about their current stage in the customer journey'
          ]
        };
      case 'title':
        return {
          text: 'What would you like to name this email sequence?',
          examples: [
            'Example: Welcome Series - New Subscriber Onboarding',
            'Example: Product Launch - Spring Collection 2024',
            'Example: Cart Recovery - Premium Plan',
            'Tip: Include the sequence type and target audience'
          ]
        };
      default:
        const prompt = defaultPrompts[step];
        if (!prompt) {
          return {
            text: '',
            examples: []
          };
        }
        return prompt;
    }
  }

  validateInput(step: Step, input: string): { isValid: boolean; error?: string } {
    switch (step) {
      case 'topic':
        return {
          isValid: input.length >= 10,
          error: 'Please provide a clear purpose for your email sequence'
        };
      case 'email-count':
        const count = parseInt(input);
        return {
          isValid: !isNaN(count) && count >= 1 && count <= 10,
          error: 'Please enter a number between 1 and 10'
        };
      case 'company-name':
        return {
          isValid: input.length >= 2,
          error: 'Please enter a valid company name'
        };
      case 'target-audience':
        return {
          isValid: input.length >= 15,
          error: 'Please be more specific about your target audience'
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
      setTopic,
      setEmailCount,
      setTargetAudience,
      setTitle,
      setKeywords,
      generateTitleSuggestions,
      generateOutline,
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
          // Store the email count in the metadata
          const metadata: Partial<EmailSequenceMetadata> = { emailCount: count };
          setKeywords([JSON.stringify(metadata)]); // Store metadata in keywords field
          setStep('company-name');
          break;

        case 'company-name':
          // Update metadata with company name
          const currentMetadata = JSON.parse(store.keywords[0] || '{}');
          const updatedMetadata: Partial<EmailSequenceMetadata> = {
            ...currentMetadata,
            companyName: input
          };
          setKeywords([JSON.stringify(updatedMetadata)]);
          setStep('target-audience');
          break;

        case 'target-audience':
          setTargetAudience(input);
          // Update metadata with target audience
          const audienceMetadata = JSON.parse(store.keywords[0] || '{}');
          const finalMetadata: EmailSequenceMetadata = {
            ...audienceMetadata,
            targetAudience: input
          };
          setKeywords([JSON.stringify(finalMetadata)]);
          await generateTitleSuggestions();
          setStep('title');
          break;

        case 'title':
          setTitle(input);
          // Wait for title to be set before generating outline
          await new Promise(resolve => setTimeout(resolve, 100));
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