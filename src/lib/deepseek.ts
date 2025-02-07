import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true
});

// Date configuration
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const targetYear = currentMonth >= 10 ? currentYear + 1 : currentYear;

const SEO_CONFIG = {
  minWords: 1200,
  maxTokens: 6000,
  allowedTags: ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'div', 'hr']
};

export const PLATFORM_LIMITS = {
  'Instagram': { chars: 2200, hashtags: 5 },
  'Twitter/X': { chars: 280, hashtags: 5 },
  'LinkedIn': { chars: 3000, hashtags: 5 },
  'Facebook': { chars: 63206, hashtags: 5 },
  'Pinterest': { chars: 500, hashtags: 5 },
  'Threads': { chars: 500, hashtags: 5 },
  'YouTube': { minLength: 3, maxLength: 15 },
  'TikTok': { minLength: 0.5, maxLength: 3 },
  'Explainer': { minLength: 1, maxLength: 5 }
} as const;

// Update type definitions
export type SocialPlatform = 'Instagram' | 'Twitter/X' | 'LinkedIn' | 'Facebook' | 'Pinterest' | 'Threads';
export type VideoPlatform = 'YouTube' | 'TikTok' | 'Explainer';
export type Platform = SocialPlatform | VideoPlatform;

interface SocialPlatformLimits {
  chars: number;
  hashtags: number;
}

interface VideoPlatformLimits {
  minLength: number;
  maxLength: number;
}

// Update the message type
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Type guard for social platforms
function isSocialPlatform(platform: Platform): platform is SocialPlatform {
  return ['Instagram', 'Twitter/X', 'LinkedIn', 'Facebook', 'Pinterest', 'Threads'].includes(platform);
}

export const contentPrompts = {
  generateTitle: (contentType: string, topic: string, platform?: Platform): ChatMessage => ({
    role: 'user' as const,
    content: contentType === 'Social Media Post'
      ? `Generate 3 engaging ${platform} post captions about "${topic}":

Requirements:
- Follow ${platform} best practices and character limits
- Include 2-3 relevant emojis strategically placed
- Start with a hook or question
- Include a clear call-to-action
- Make it conversational and engaging
${platform === 'Twitter/X' ? '- Keep within 280 characters\n' : ''}
${platform === 'Instagram' ? '- Optimize for visual content reference\n' : ''}
${platform === 'LinkedIn' ? '- Maintain professional tone\n' : ''}

Format your response EXACTLY like this:
1. First caption here
2. Second caption here
3. Third caption here

CRITICAL:
- Return EXACTLY 3 numbered captions
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each caption must be unique and engaging
- Include emojis naturally in the flow`
      : `Generate exactly 3 engaging titles for a ${contentType} about "${topic}"${platform ? ` for ${platform}` : ''}.

Requirements:
- Keep each title under 60 characters
- Include power words (Essential, Ultimate, Proven)
- Make them engaging and SEO-optimized
- Include "${targetYear}" in at least one title
${contentType === 'Landing Page' ? '- Add a pipe (|) for OG title variant' : ''}
${platform ? `- Follow ${platform} best practices` : ''}

Format your response EXACTLY like this:
1. First Title Here (with year)
2. Second Title Here
3. Third Title Here

CRITICAL:
- Return EXACTLY 3 numbered titles
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each title must be unique and relevant
- First title MUST include the year ${targetYear}`
  }),

  generateKeywords: (topic: string, platform?: Platform) => ({
    role: 'user' as const,
    content: platform && isSocialPlatform(platform)
      ? `Generate relevant hashtags for ${platform} post about "${topic}":
        - Mix trending and niche tags
        - Include brand-relevant tags
        - Maximum ${PLATFORM_LIMITS[platform].hashtags} hashtags
        - Follow ${platform} best practices
        - Include a mix of:
          * Industry-specific tags
          * Campaign-related tags
          * Trending/popular tags
          * Brand-specific tags
        
        Output as comma-separated list with # prefix`
      : `Generate 7 SEO keywords for "${topic}" including:
        - ${currentYear} versions
        - Long-tail phrases
        - Common variations
        Output as comma-separated list`
  }),

  generateLSIKeywords: (keywords: string[], platform?: Platform) => ({
    role: 'user' as const,
    content: platform && isSocialPlatform(platform)
      ? `Generate additional hashtags related to: ${keywords.join(', ')}
        - Mix trending and niche tags
        - Relevant to ${platform} audience
        - Maximum ${PLATFORM_LIMITS[platform].hashtags} suggestions
        - Include popular variations
        - Focus on:
          * Related industry terms
          * Similar campaign types
          * Complementary topics
          * Audience interests
        
        Output as comma-separated list with # prefix`
      : `Generate exactly 15 LSI keywords and phrases related to: ${keywords.join(', ')}
        - Include semantic variations and related terms
        - Mix of short-tail and long-tail phrases
        - Focus on high-search-volume terms
        - Ensure relevance to main topic
        - Avoid exact matches to the original keywords
        - Include trending industry terms
        - Mix of broad and specific phrases
        
        Output EXACTLY 15 unique keywords/phrases as comma-separated list.
        Do not number the items.
        Do not include the original keywords.`
  }),

  generateOutline: (contentType: string, topic: string, title: string, platform?: Platform): ChatMessage => ({
    role: 'user' as const,
    content: contentType === 'Social Media Post'
      ? `Create ${platform} post structure for "${title}" about "${topic}":

Requirements:
- Follow ${platform} best practices
- Include all necessary components
- Optimize for engagement

Format your response as a JSON structure:
{
  "platform": "${platform}",
  "structure": {
    "hook": "Opening hook or question",
    "body": "Main message/value proposition",
    "details": "Supporting points or features",
    "cta": "Call to action",
    "media": ["[IMAGE 1: Description]", "[VIDEO: Description]"],
    "hashtags": "Hashtag placement strategy"
  }
}

Make it specific and actionable.`
      : `Create a detailed outline for ${contentType} titled "${title}" about ${topic}.

Requirements:
- Include 5-8 main sections
- Each section must have 2-4 subsections or points
- Include a mix of different content types (headings, lists, CTAs)
- Maintain logical flow
- Focus on value delivery

Format your response in this EXACT structure:
[H1] Introduction
[H2] Hook Statement
[LIST] 
- Key problem point
- Current market situation
- Reader's pain points

[H1] [Section Title]
[H2] Main Point
[LIST]
- Supporting detail
- Example or case study
- Statistical evidence

CRITICAL:
- Use ONLY these prefixes: [H1], [H2], [LIST], [CTA]
- [H1] for main sections
- [H2] for subsections
- [LIST] followed by bullet points
- [CTA] for call-to-actions
- Each section must start with [H1]
- Keep hierarchy consistent
- Do not include any other formatting or text`
  })
};

// Update the generateContent function signature
export async function generateContent(messages: ChatMessage[]) {
  try {
    const messageContent = messages[0].content.toLowerCase();
    
    // For outline generation
    if (messageContent.includes('create a detailed outline')) {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system' as const,
            content: 'You are a content strategist specializing in creating well-structured content outlines.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      });

      return { content: response.choices[0].message.content || '' };
    }

    // For regular content generation
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system' as const,  
          content: `Create high-quality, engaging content that is:
          1. Well-structured with proper HTML tags
          2. SEO-optimized
          3. Audience-focused
          4. Clear and concise
          5. Properly formatted`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: SEO_CONFIG.maxTokens,
      top_p: 0.9
    });

    return { content: response.choices[0].message.content || '' };
  } catch (error: any) {
    console.error('Content generation error:', error);
    throw new Error(error.message || 'Failed to generate content. Please try again.');
  }
}