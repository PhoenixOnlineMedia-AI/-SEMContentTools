import type { Step, ContentType } from '../../../lib/store';
import type { Platform } from '../../../lib/deepseek';

export interface ChatPrompt {
  text: string;
  examples: string[];
  tip?: string;
  hashtags?: {
    text: string;
    examples: string[];
  };
}

export type PromptConfig = Record<Step, ChatPrompt>;

export interface PlatformPrompt {
  topic: ChatPrompt;
  title: ChatPrompt;
  hashtags: ChatPrompt;
}

export const platformPrompts: Record<Platform, PlatformPrompt> = {
  Instagram: {
    topic: {
      text: 'What would you like to share on Instagram?',
      examples: [
        'Example: Behind-the-scenes content',
        'Example: Product showcase',
        'Example: User-generated content feature'
      ]
    },
    title: {
      text: 'Select a caption style for your post:',
      examples: [
        'Example: Engaging and conversational',
        'Example: Professional and informative',
        'Example: Fun and entertaining'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #socialmediatips, #digitalmarketing, #growthhacking',
        'Example: #smallbusiness, #entrepreneurship, #startup',
        'Example: #brandawareness, #communitybuilding, #engagement'
      ]
    }
  },
  'Twitter/X': {
    topic: {
      text: 'What would you like to share on Twitter/X?',
      examples: [
        'Example: Industry insights',
        'Example: Company updates',
        'Example: Thought leadership'
      ]
    },
    title: {
      text: 'Select a tweet style:',
      examples: [
        'Example: Concise and impactful',
        'Example: Question-based engagement',
        'Example: Data-driven insights'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #tech, #innovation, #future',
        'Example: #startup, #entrepreneurship, #business',
        'Example: #marketing, #growth, #strategy'
      ]
    }
  },
  LinkedIn: {
    topic: {
      text: 'What would you like to share on LinkedIn?',
      examples: [
        'Example: Professional achievement',
        'Example: Industry analysis',
        'Example: Company milestone'
      ]
    },
    title: {
      text: 'Select a post style:',
      examples: [
        'Example: Professional insight',
        'Example: Success story',
        'Example: Industry trend analysis'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #leadership, #professionaldevelopment, #career',
        'Example: #business, #innovation, #technology',
        'Example: #networking, #jobsearch, #recruitment'
      ]
    }
  },
  Facebook: {
    topic: {
      text: 'What would you like to share on Facebook?',
      examples: [
        'Example: Community update',
        'Example: Event announcement',
        'Example: Customer success story'
      ]
    },
    title: {
      text: 'Select a post style:',
      examples: [
        'Example: Community-focused',
        'Example: Informative and engaging',
        'Example: Story-based content'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #community, #events, #local',
        'Example: #business, #smallbusiness, #support',
        'Example: #customerservice, #feedback, #growth'
      ]
    }
  },
  Pinterest: {
    topic: {
      text: 'What would you like to share on Pinterest?',
      examples: [
        'Example: Visual inspiration',
        'Example: DIY tutorial',
        'Example: Product showcase'
      ]
    },
    title: {
      text: 'Select a pin style:',
      examples: [
        'Example: Inspirational and creative',
        'Example: Step-by-step guide',
        'Example: Product highlight'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #inspiration, #design, #creative',
        'Example: #diy, #howto, #tutorial',
        'Example: #style, #decor, #lifestyle'
      ]
    }
  },
  Threads: {
    topic: {
      text: 'What would you like to share on Threads?',
      examples: [
        'Example: Quick update',
        'Example: Conversation starter',
        'Example: Industry insight'
      ]
    },
    title: {
      text: 'Select a thread style:',
      examples: [
        'Example: Conversational and engaging',
        'Example: Quick insights',
        'Example: Discussion prompt'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #discussion, #community, #conversation',
        'Example: #insights, #thoughts, #ideas',
        'Example: #trending, #news, #updates'
      ]
    }
  },
  YouTube: {
    topic: {
      text: 'What would you like to share on YouTube?',
      examples: [
        'Example: Tutorial video',
        'Example: Product review',
        'Example: Behind-the-scenes'
      ]
    },
    title: {
      text: 'Select a video style:',
      examples: [
        'Example: Educational content',
        'Example: Entertainment focus',
        'Example: Brand storytelling'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #tutorial, #howto, #education',
        'Example: #review, #unboxing, #product',
        'Example: #vlog, #behindthescenes, #creator'
      ]
    }
  },
  TikTok: {
    topic: {
      text: 'What would you like to share on TikTok?',
      examples: [
        'Example: Educational content',
        'Example: Trending challenge',
        'Example: Brand personality showcase'
      ]
    },
    title: {
      text: 'Select a video style:',
      examples: [
        'Example: Entertaining and engaging',
        'Example: Quick tips and tricks',
        'Example: Trending format'
      ]
    },
    hashtags: {
      text: 'What hashtags would you like to use? (comma-separated)',
      examples: [
        'Example: #fyp, #viral, #trending',
        'Example: #learn, #tips, #howto',
        'Example: #business, #creator, #community'
      ]
    }
  },
  Explainer: {
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

export const contentTypePrompts: Record<ContentType, ChatPrompt> = {
  'Blog Post': {
    text: 'What topic would you like to write about?',
    examples: [
      'Example: Digital marketing trends for small businesses',
      'Example: Sustainable living tips for beginners',
      'Example: Cryptocurrency investing guide for newcomers'
    ]
  },
  'Landing Page': {
    text: 'What product, service, or offer would you like to create a landing page for?',
    examples: [
      'Example: SaaS product that automates social media scheduling',
      'Example: Free consultation for business coaching services',
      'Example: Early-bird access to an online course launch'
    ],
    tip: 'Tip: Be specific about your main offer and target audience'
  },
  'Social Media Post': {
    text: 'What topic or message would you like to share on social media?',
    examples: [
      'Example: New product launch announcement',
      'Example: Industry insights and tips',
      'Example: Behind-the-scenes company culture'
    ]
  },
  'Video Script': {
    text: 'What topic would you like to create a video script about?',
    examples: [
      'Example: Product demonstration and features walkthrough',
      'Example: Educational tutorial on industry best practices',
      'Example: Company story and mission showcase'
    ]
  },
  'Service Page': {
    text: 'What service would you like to create a page for?',
    examples: [
      'Example: Professional photography services',
      'Example: Web development and design packages',
      'Example: Business consulting solutions'
    ]
  },
  'Email Sequence': {
    text: 'What type of email sequence would you like to create?',
    examples: [
      'Example: Welcome series for new subscribers',
      'Example: Product launch campaign',
      'Example: Customer onboarding sequence'
    ]
  },
  'Listicle': {
    text: 'What topic would you like to create a listicle about?',
    examples: [
      'Example: Top productivity tools for remote teams',
      'Example: Best practices for content marketing',
      'Example: Essential tips for home organization'
    ]
  },
  'Resource Guide': {
    text: 'What topic would you like to create a resource guide for?',
    examples: [
      'Example: Complete guide to starting an online business',
      'Example: Ultimate resource list for learning web development',
      'Example: Comprehensive guide to digital marketing tools'
    ]
  }
};

export const PLATFORM_PROMPTS: Record<Platform, PlatformPrompt> = {
  Instagram: {
    topic: {
      examples: [
        'Share behind-the-scenes of our design process',
        'New product launch with lifestyle photos',
        'Customer success story with visuals',
        'Industry tips with engaging graphics'
      ],
      text: 'What topic would you like to create an Instagram post about?'
    },
    title: {
      examples: [
        '✨ Transforming spaces, one design at a time',
        '🎨 The art of minimal design: Less is more',
        '🌟 Meet the team behind the magic',
        '💡 5 design tips you need to know'
      ],
      text: 'What caption would you like for your Instagram post? (Include emojis for better engagement)'
    },
    hashtags: {
      examples: [
        '#interiordesign #homedecor #designinspo',
        '#techstartup #innovation #futureofwork',
        '#smallbusiness #entrepreneurlife #growth',
        '#marketing #digitalstrategy #socialmedia'
      ],
      text: 'What are 3-5 main hashtags for your post? (I will generate additional relevant ones)'
    }
  },
  'Twitter/X': {
    topic: {
      examples: [
        'Share industry news with insights',
        'Quick tip about our product',
        'Customer testimonial highlight',
        'Behind-the-scenes team moment'
      ],
      text: 'What topic would you like to create a Twitter post about?'
    },
    title: {
      examples: [
        'Breaking: Our latest feature just dropped! 🚀',
        'Pro tip: Here\'s how to 10x your productivity ⚡️',
        'We\'re thrilled to announce our newest partnership 🤝',
        'Question for our community: What\'s your biggest challenge? 🤔'
      ],
      text: 'What would you like to tweet? (Remember 280 character limit)'
    },
    hashtags: {
      examples: [
        '#TechNews #Innovation',
        '#StartupLife #Growth',
        '#MarketingTips #DigitalMarketing',
        '#ProductLaunch #Tech'
      ],
      text: 'What are 2-3 main hashtags for your tweet? (I will generate additional relevant ones)'
    }
  },
  LinkedIn: {
    topic: {
      examples: [
        'Share industry insights and analysis',
        'Company milestone announcement',
        'Team culture spotlight',
        'Professional development tips'
      ],
      text: 'What topic would you like to create a LinkedIn post about?'
    },
    title: {
      examples: [
        'Excited to share our latest industry report on the future of work 📊',
        'Proud to announce: We\'ve hit a major milestone! 🎉',
        'Three key insights from our recent client success 💡',
        'Leadership lesson: Building high-performing teams starts with... 🚀'
      ],
      text: 'What would you like to share on LinkedIn? (Professional but engaging)'
    },
    hashtags: {
      examples: [
        '#Leadership #ProfessionalDevelopment',
        '#BusinessStrategy #Innovation',
        '#CompanyCulture #FutureOfWork',
        '#IndustryInsights #Growth'
      ],
      text: 'What are 2-3 main hashtags for your post? (I will generate additional relevant ones)'
    }
  }
};