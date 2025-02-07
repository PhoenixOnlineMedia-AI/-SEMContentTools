import type { Step } from '../../../lib/store';
import type { Platform } from '../../../lib/deepseek';

export interface ChatPrompt {
  text: string;
  examples: string[];
  hashtags?: {
    text: string;
    examples: string[];
  };
}

export type PromptConfig = Record<Step, ChatPrompt>;

export const platformPrompts: Record<Platform, ChatPrompt> = {
  'Instagram': {
    text: 'What would you like to share on Instagram?',
    examples: [
      'Example: Behind-the-scenes look at our team',
      'Example: Product showcase with lifestyle photos',
      'Example: Quick tips and industry insights'
    ],
    hashtags: {
      text: 'Enter your Instagram hashtags (separated by commas):',
      examples: [
        'Example: #InstaMarketing, #BrandGrowth, #InstaBusiness',
        'Mix popular tags like #InstaDaily with niche ones',
        'Tip: Use up to 5 strategic hashtags for better reach'
      ]
    }
  },
  'Twitter/X': {
    text: 'What would you like to tweet about?',
    examples: [
      'Example: Industry news and commentary',
      'Example: Quick tips in a thread format',
      'Example: Engaging question for your audience'
    ],
    hashtags: {
      text: 'Enter your Twitter hashtags (separated by commas):',
      examples: [
        'Example: #TechNews, #StartupLife, #Innovation',
        'Use trending hashtags relevant to your topic',
        'Tip: 2-3 hashtags work best for Twitter engagement'
      ]
    }
  },
  'LinkedIn': {
    text: 'What would you like to share on LinkedIn?',
    examples: [
      'Example: Professional achievement or milestone',
      'Example: Industry insights and analysis',
      'Example: Company culture and team highlights'
    ],
    hashtags: {
      text: 'Enter your LinkedIn hashtags (separated by commas):',
      examples: [
        'Example: #Leadership, #ProfessionalDevelopment, #Innovation',
        'Use industry-specific and professional hashtags',
        'Tip: 3-5 relevant hashtags for professional context'
      ]
    }
  },
  'Facebook': {
    text: 'What would you like to post on Facebook?',
    examples: [
      'Example: Company update or announcement',
      'Example: Customer success story',
      'Example: Community engagement post'
    ],
    hashtags: {
      text: 'Enter your Facebook hashtags (separated by commas):',
      examples: [
        'Example: #SmallBusiness, #LocalBusiness, #CommunityFirst',
        'Use branded and campaign-specific hashtags',
        'Tip: 2-3 targeted hashtags for better reach'
      ]
    }
  },
  'Threads': {
    text: 'What would you like to share on Threads?',
    examples: [
      'Example: Industry conversation starter',
      'Example: Quick insights and observations',
      'Example: Engaging with current trends'
    ],
    hashtags: {
      text: 'Enter your Threads hashtags (separated by commas):',
      examples: [
        'Example: #TechTalk, #CreatorEconomy, #FutureOfWork',
        'Mix trending and niche conversation hashtags',
        'Tip: 3-4 hashtags to join relevant conversations'
      ]
    }
  },
  'Pinterest': {
    text: 'What would you like to pin on Pinterest?',
    examples: [
      'Example: Visual guide or infographic',
      'Example: Inspirational design showcase',
      'Example: Step-by-step tutorial with images'
    ]
  },
  'YouTube': {
    text: 'What type of video would you like to create?',
    examples: [
      'Example: In-depth tutorial (10-15 minutes)',
      'Example: Product review and demonstration',
      'Example: Expert interview or discussion'
    ]
  },
  'TikTok': {
    text: 'What type of TikTok would you like to create?',
    examples: [
      'Example: Quick tip or life hack (30-60 seconds)',
      'Example: Behind-the-scenes glimpse',
      'Example: Trending challenge participation'
    ]
  },
  'Explainer': {
    text: 'What would you like to explain in your video?',
    examples: [
      'Example: Product features and benefits',
      'Example: Service process walkthrough',
      'Example: Complex concept simplified'
    ]
  }
};

export const defaultPrompts: PromptConfig = {
  type: {
    text: 'What type of content would you like to create?',
    examples: []
  },
  platform: {
    text: 'Select the platform for your content:',
    examples: []
  },
  topic: {
    text: 'Tell me about your topic:',
    examples: [
      'Example: Digital marketing trends for small businesses',
      'Example: Sustainable living tips for urban dwellers',
      'Example: Beginner\'s guide to cryptocurrency investing'
    ]
  },
  title: {
    text: 'Choose one of the suggested titles below or enter your own creative title:',
    examples: []
  },
  keywords: {
    text: 'Enter your target keywords (separated by commas):',
    examples: [
      'Example: digital marketing, SEO tips, online visibility',
      'Example: healthy recipes, meal prep, nutrition guide',
      'Tip: Include both broad and specific keywords'
    ]
  },
  lsi: {
    text: 'Select keywords to optimize your content:',
    examples: []
  },
  outline: {
    text: 'Review and customize your content outline:',
    examples: [
      'Tip: Add, remove, or reorder sections as needed',
      'Tip: Ensure a logical flow between sections',
      'Tip: Include key points you want to cover'
    ]
  },
  content: {
    text: 'Review your generated content:',
    examples: []
  },
  'service-location': {
    text: 'Enter primary service area:',
    examples: [
      'Format: City, State (e.g., Austin, TX)',
      'Neighborhoods: Downtown Seattle, WA',
      'Metro area: Phoenix Metro Area'
    ]
  },
  'location-toggle': {
    text: 'Does this service target specific locations?',
    examples: ['Check for local services like plumbing or electricians']
  },
  'local-keywords': {
    text: 'Add location-specific keywords:',
    examples: [
      'Example: Austin plumbing emergency',
      'Example: 24/7 electricians near me',
      'Tip: Include nearby landmarks'
    ]
  },
  hashtags: {
    text: 'Enter your hashtags (separated by commas):',
    examples: [
      'Example: #DigitalMarketing, #SmallBusiness, #GrowthTips',
      'Example: #SustainableLiving, #EcoFriendly, #GreenLiving',
      'Tip: Mix trending and niche hashtags'
    ]
  },
  'email-count': {
    text: 'How many emails in this sequence?',
    examples: [
      'Typically 3-7 emails work best',
      'More than 7 may overwhelm recipients',
      'Fewer than 3 might not build enough momentum'
    ]
  },
  'target-audience': {
    text: 'Describe your target audience:',
    examples: [
      'Example: SaaS trial users who didn\'t convert',
      'Example: E-commerce customers with abandoned carts',
      'Example: Leads who downloaded our whitepaper'
    ]
  }
};

export const contentTypePrompts: Record<string, ChatPrompt> = {
  'Blog Post': {
    text: 'Tell me about your topic:',
    examples: [
      'Example: Digital marketing trends for small businesses',
      'Example: Sustainable living tips for urban dwellers',
      'Example: Beginner\'s guide to cryptocurrency investing'
    ]
  },
  'Landing Page': {
    text: 'What is the primary purpose of this landing page?',
    examples: [
      'Example: Convert visitors to trial signups',
      'Example: Promote new product launch',
      'Example: Generate service inquiries'
    ]
  },
  'Service Page': {
    text: 'What service would you like to promote?',
    examples: [
      'Example: Professional web design services',
      'Example: Local plumbing and repair',
      'Example: Business consulting solutions'
    ]
  },
  'Email Sequence': {
    text: 'What is the goal of this email sequence?',
    examples: [
      'Example: Welcome and onboard new subscribers',
      'Example: Launch a new product or service',
      'Example: Re-engage inactive customers'
    ]
  },
  'Listicle': {
    text: 'What topic would you like to create a list about?',
    examples: [
      'Example: Top 10 productivity tools for remote teams',
      'Example: 15 essential tips for first-time homebuyers',
      'Example: 7 effective strategies for social media growth'
    ]
  },
  'Resource Guide': {
    text: 'What topic would you like to create a comprehensive guide for?',
    examples: [
      'Example: Complete guide to starting an online business',
      'Example: Ultimate resource for home gardening',
      'Example: Comprehensive guide to personal finance'
    ]
  }
};