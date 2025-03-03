import { ContentHandler } from './ContentHandler';
import { defaultPrompts, contentTypePrompts } from '../configs/prompts';
import type { Step, ContentState } from '../../../lib/store';
import type { ChatPrompt } from '../configs/prompts';
import type { OutlineItem } from '../../../lib/store';

interface ServicePageMetadata {
  businessName?: string;
  location?: {
    city: string;
    state: string;
    isMetroArea: boolean;
  };
  serviceArea?: string[];
  primaryService: string;
  targetAudience?: string;
  usesLocation: boolean;
}

export class ServicePageHandler implements ContentHandler {
  getPrompt(step: Step): ChatPrompt {
    if (step === 'topic') {
      return {
        text: 'What is the primary service you want to create a page for?',
        examples: [
          'Example: Professional house cleaning services',
          'Example: Commercial HVAC installation and repair',
          'Example: Wedding photography and videography'
        ]
      };
    }

    if (step === 'business-name') {
      return {
        text: 'What is your business name? (Leave empty if you don\'t want to include it)',
        examples: [
          'Example: Smith & Sons Plumbing',
          'Example: Elite Photography Studios',
          'Example: Green Clean Services',
          'Tip: This is optional - press Enter to skip'
        ]
      };
    }

    if (step === 'location-toggle') {
      return {
        text: 'Is this service specific to a location or area?',
        examples: [
          'Type "yes" if this is a local service (e.g., plumbing, cleaning)',
          'Type "no" if this is location-independent (e.g., online services)',
          'This helps optimize the content for local SEO if needed'
        ]
      };
    }

    if (step === 'service-location') {
      return {
        text: 'What is your primary service area?',
        examples: [
          'Format: City, State (e.g., Austin, TX)',
          'Format: City Metro Area (e.g., Phoenix Metro Area)',
          'Tip: This will be used for local SEO optimization'
        ]
      };
    }

    if (step === 'service-area') {
      return {
        text: 'List additional areas you serve (separated by commas, leave empty if none):',
        examples: [
          'Example: North Austin, Round Rock, Cedar Park',
          'Example: Greater Phoenix Area, Scottsdale, Tempe',
          'Tip: These will be used in your service area section'
        ]
      };
    }

    if (step === 'target-audience') {
      return {
        text: 'Who is your target audience for this service?',
        examples: [
          'Example: Homeowners in need of regular house cleaning',
          'Example: Commercial property managers requiring HVAC maintenance',
          'Example: Engaged couples planning their wedding'
        ]
      };
    }

    if (step === 'keywords') {
      return {
        text: 'Enter your target keywords (separated by commas):',
        examples: [
          'Include location-specific keywords',
          'Example: austin house cleaning, maid service austin tx, residential cleaning',
          'Example: phoenix hvac repair, emergency ac service phoenix, commercial hvac'
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
          isValid: input.length >= 5,
          error: 'Please provide a clear service description'
        };
      case 'business-name':
        // Business name is optional
        return { isValid: true };
      case 'location-toggle':
        return {
          isValid: ['yes', 'no'].includes(input.toLowerCase()),
          error: 'Please enter "yes" or "no"'
        };
      case 'service-location':
        if (input.trim() === '') return { isValid: true }; // Optional if not location-specific
        const locationRegex = /^[A-Za-z\s]+(Metro\s+Area|,\s*[A-Z]{2})$/;
        return {
          isValid: locationRegex.test(input),
          error: 'Please use format: City, ST or City Metro Area'
        };
      case 'target-audience':
        return {
          isValid: input.length >= 10,
          error: 'Please provide more details about your target audience'
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

  private parseLocation(input: string): { city: string; state: string; isMetroArea: boolean } | null {
    if (!input) return null;
    
    const metroAreaMatch = input.match(/^(.*?)\s+Metro\s+Area$/i);
    if (metroAreaMatch) {
      return {
        city: metroAreaMatch[1].trim(),
        state: '',
        isMetroArea: true
      };
    }

    const cityStateMatch = input.match(/^(.*?),\s*([A-Z]{2})$/);
    if (cityStateMatch) {
      return {
        city: cityStateMatch[1].trim(),
        state: cityStateMatch[2],
        isMetroArea: false
      };
    }

    return null;
  }

  private createServiceMetadata(
    primaryService: string,
    businessName: string | undefined,
    location: string | undefined,
    serviceArea: string[],
    targetAudience: string | undefined,
    usesLocation: boolean
  ): ServicePageMetadata {
    return {
      businessName: businessName || undefined,
      location: location ? this.parseLocation(location) || undefined : undefined,
      serviceArea: serviceArea.length > 0 ? serviceArea : undefined,
      primaryService,
      targetAudience,
      usesLocation
    };
  }

  generateLocationBasedOutline(metadata: ServicePageMetadata): OutlineItem[] {
    const {
      businessName,
      location,
      serviceArea,
      primaryService,
      targetAudience,
      usesLocation
    } = metadata;

    const outline: OutlineItem[] = [];

    // Main title
    const locationString = location ? `${location.city}, ${location.state}` : '';
    const mainTitle = usesLocation && location
      ? `${primaryService} in ${locationString}`
      : primaryService;

    outline.push({
      id: crypto.randomUUID(),
      type: 'h1',
      content: mainTitle
    });

    // Introduction section
    outline.push({
      id: crypto.randomUUID(),
      type: 'h2',
      content: 'Introduction'
    });

    // Add company overview if business name is provided
    if (businessName) {
      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'Company Overview',
        items: [
          `About ${businessName}`,
          'Years of experience and expertise',
          'Mission and values',
          'Commitment to quality service'
        ]
      });
    }

    // Add location-specific sections if applicable
    if (usesLocation && location) {
      // Add location-specific introduction
      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: `${primaryService} in ${locationString}`,
        items: [
          `Overview of ${primaryService} needs in ${locationString}`,
          `Common ${primaryService} challenges in ${locationString}`,
          `Why professional ${primaryService} is important in ${locationString}`,
          `Benefits of local ${primaryService} providers in ${locationString}`
        ]
      });

      const areaItems = [
        `Primary service area: ${locationString}`,
        ...(serviceArea || []).map(area => `Additional coverage: ${area}`)
      ];

      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'Service Areas',
        items: areaItems
      });

      // Add local expertise section with more detailed items
      outline.push({
        id: crypto.randomUUID(),
        type: 'h2',
        content: `Local ${primaryService} Expertise in ${locationString}`
      });

      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'Local Expertise',
        items: [
          `Deep understanding of ${locationString}'s specific needs and requirements`,
          `Knowledge of local ${primaryService} regulations and compliance in ${locationString}`,
          `Established relationships with local suppliers and partners in ${locationString}`,
          `Familiarity with ${locationString}'s unique challenges and customized solutions`,
          `Experience serving the ${locationString} community`
        ]
      });
      
      // Add location-specific benefits section
      outline.push({
        id: crypto.randomUUID(),
        type: 'h2',
        content: `Benefits of Choosing a Local ${primaryService} Provider in ${locationString}`
      });
      
      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'Local Benefits',
        items: [
          `Faster response times for ${locationString} residents`,
          `Personalized service tailored to ${locationString}'s unique needs`,
          `Understanding of local climate and environmental factors in ${locationString}`,
          `Knowledge of ${locationString}'s building codes and permit requirements`,
          `Strong reputation within the ${locationString} community`
        ]
      });
      
      // Add location-specific FAQ section
      outline.push({
        id: crypto.randomUUID(),
        type: 'h2',
        content: `Frequently Asked Questions About ${primaryService} in ${locationString}`
      });
      
      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'FAQs',
        items: [
          `What makes ${primaryService} in ${locationString} unique?`,
          `How much does ${primaryService} typically cost in ${locationString}?`,
          `What are the most common ${primaryService} issues in ${locationString}?`,
          `How quickly can I expect service in the ${locationString} area?`,
          `Are there any ${locationString}-specific regulations I should know about?`
        ]
      });
    }

    // Add services section with more detailed structure
    outline.push({
      id: crypto.randomUUID(),
      type: 'h2',
      content: 'Our Services'
    });
    
    outline.push({
      id: crypto.randomUUID(),
      type: 'list',
      content: `${primaryService} Services We Offer`,
      items: [
        'Comprehensive service assessment and consultation',
        'Professional installation and setup',
        'Maintenance and regular service plans',
        'Emergency repair services',
        'Upgrades and modernization solutions'
      ]
    });

    // Add target audience section if specified
    if (targetAudience) {
      outline.push({
        id: crypto.randomUUID(),
        type: 'h2',
        content: 'Who We Serve'
      });

      outline.push({
        id: crypto.randomUUID(),
        type: 'list',
        content: 'Target Audience',
        items: [
          targetAudience,
          'Customized solutions for your specific needs',
          'Industry-specific expertise and knowledge',
          'Tailored service packages for different client requirements',
          'Flexible scheduling to accommodate your timeline'
        ]
      });
    }
    
    // Add testimonials section
    outline.push({
      id: crypto.randomUUID(),
      type: 'h2',
      content: usesLocation && location ? `What Our ${locationString} Customers Say` : 'What Our Customers Say'
    });
    
    outline.push({
      id: crypto.randomUUID(),
      type: 'list',
      content: 'Testimonials',
      items: [
        'Customer success stories',
        'Before and after scenarios',
        'Problem-solution examples',
        'Long-term client relationships'
      ]
    });
    
    // Add process section
    outline.push({
      id: crypto.randomUUID(),
      type: 'h2',
      content: 'Our Process'
    });
    
    outline.push({
      id: crypto.randomUUID(),
      type: 'list',
      content: 'How We Work',
      items: [
        'Initial consultation and assessment',
        'Customized solution development',
        'Implementation and service delivery',
        'Follow-up and ongoing support',
        'Quality assurance and satisfaction guarantee'
      ]
    });

    // Add call to action
    outline.push({
      id: crypto.randomUUID(),
      type: 'cta',
      content: `Contact ${businessName || 'Us'} Today for Professional ${primaryService}${usesLocation && location ? ` in ${locationString}` : ''}`
    });

    return outline;
  }

  async processInput(step: Step, input: string, store: ContentState): Promise<void> {
    const {
      setTopic,
      setTitle,
      setOutline,
      generateTitleSuggestions,
      generateLSIKeywords,
      generateOutline,
      setStep,
      setError,
      topic,
      outline,
      setKeywords
    } = store;

    try {
      switch (step) {
        case 'topic':
          setTopic(input);
          setStep('business-name');
          break;

        case 'business-name':
          const metadata = this.createServiceMetadata(
            topic,
            input || undefined,
            undefined,
            [],
            undefined,
            false
          );
          setOutline([{ id: 'metadata', type: 'metadata', content: JSON.stringify(metadata) }]);
          setStep('location-toggle');
          break;

        case 'location-toggle':
          const useLocation = input.toLowerCase() === 'yes';
          const currentMetadata = JSON.parse(outline[0]?.content || '{}');
          setOutline([{
            id: 'metadata',
            type: 'metadata',
            content: JSON.stringify({ ...currentMetadata, usesLocation: useLocation })
          }]);
          setStep(useLocation ? 'service-location' : 'target-audience');
          break;

        case 'service-location':
          const metadataWithLocation = JSON.parse(outline[0]?.content || '{}');
          setOutline([{
            id: 'metadata',
            type: 'metadata',
            content: JSON.stringify({ ...metadataWithLocation, location: this.parseLocation(input) })
          }]);
          setStep('service-area');
          break;

        case 'service-area':
          const areas = input ? input.split(',').map(area => area.trim()).filter(Boolean) : [];
          const metadataWithAreas = JSON.parse(outline[0]?.content || '{}');
          setOutline([{
            id: 'metadata',
            type: 'metadata',
            content: JSON.stringify({ ...metadataWithAreas, serviceArea: areas })
          }]);
          setStep('target-audience');
          break;

        case 'target-audience':
          const metadataWithAudience = JSON.parse(outline[0]?.content || '{}');
          setOutline([{
            id: 'metadata',
            type: 'metadata',
            content: JSON.stringify({ ...metadataWithAudience, targetAudience: input })
          }]);
          setStep('keywords');
          break;

        case 'keywords':
          const keywordList = input.split(',').map(k => k.trim()).filter(Boolean);
          setKeywords(keywordList);
          await generateLSIKeywords(keywordList);
          setStep('lsi');
          break;

        case 'lsi':
          // Get the metadata before generating titles
          const metadataForTitles = JSON.parse(outline[0]?.content || '{}');
          // Pass metadata to generateTitleSuggestions
          await generateTitleSuggestions(metadataForTitles);
          setStep('title');
          break;

        case 'title':
          setTitle(input);
          // Get the metadata from the outline
          const metadataFromOutline = JSON.parse(outline[0]?.content || '{}');
          // Generate location-based outline
          const locationBasedOutline = this.generateLocationBasedOutline(metadataFromOutline);
          // Set the new outline
          setOutline(locationBasedOutline);
          setStep('outline');
          break;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred processing your input');
      throw error;
    }
  }
}