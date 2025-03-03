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
  minWords: 1500,
  maxTokens: 8000,
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
  generateTitle: (contentType: string, topic: string, platform?: Platform, metadata?: any): ChatMessage => ({
    role: 'user' as const,
    content: contentType === 'Service Page' && metadata
      ? `Generate 3 SEO-optimized titles for a service page about "${topic}"${metadata.businessName ? ` for ${metadata.businessName}` : ''}${metadata.location ? ` in ${metadata.location.isMetroArea ? `${metadata.location.city} Metro Area` : `${metadata.location.city}, ${metadata.location.state}`}` : ''}.

Requirements:
- Include the business name (${metadata.businessName || 'if provided'}) naturally in the titles
- Include the location (${metadata.location ? metadata.location.isMetroArea ? `${metadata.location.city} Metro Area` : `${metadata.location.city}, ${metadata.location.state}` : 'if provided'})
- Keep each title under 60 characters
- Make them engaging and SEO-optimized
- Include "${targetYear}" in at least one title
- Focus on local SEO if location is provided

Format your response EXACTLY like this:
1. First Title Here (with year and location)
2. Second Title Here (with business name)
3. Third Title Here (with both if possible)

CRITICAL:
- Return EXACTLY 3 numbered titles
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each title must be unique and relevant
- First title MUST include the year ${targetYear}`
      : contentType === 'Email Sequence' && metadata
      ? `Generate 3 titles for an email sequence about "${topic}" for ${metadata.companyName}.

Requirements:
- Include the company name (${metadata.companyName}) in at least one title
- Include the sequence type (welcome, onboarding, etc.)
- Include the target audience (${metadata.targetAudience})
- Keep each title under 60 characters
- Make them clear and descriptive
- Include "${targetYear}" in at least one title

Format your response EXACTLY like this:
1. First Title Here (with year and ${metadata.companyName})
2. Second Title Here (with sequence type)
3. Third Title Here (with target audience)

CRITICAL:
- Return EXACTLY 3 numbered titles
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each title must be unique and relevant
- First title MUST include both the year ${targetYear} and ${metadata.companyName}
- At least one other title must include ${metadata.companyName}`
      : contentType === 'Social Media Post'
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
      : contentType === 'Listicle'
      ? `Generate 3 engaging listicle titles about "${topic}".

Requirements:
- Include a number in each title (5, 7, 10, etc.)
- Keep each title under 60 characters
- Make them engaging and SEO-optimized
- Include "${targetYear}" in at least one title
- Use power words (Essential, Ultimate, Top, Best)
- Focus on value delivery (tips, strategies, examples)

Format your response EXACTLY like this:
1. First Title Here (with number and year)
2. Second Title Here (with number and power word)
3. Third Title Here (with number and benefit)

CRITICAL:
- Return EXACTLY 3 numbered titles
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each title must be unique and relevant
- Each title MUST include a number (e.g., "10 Best Ways to...")
- First title MUST include the year ${targetYear}`
      : contentType === 'Resource Guide'
      ? `Generate 3 engaging resource guide titles about "${topic}".

Requirements:
- Include phrases like "Ultimate Guide," "Complete Resource," or "Comprehensive Collection"
- Keep each title under 60 characters
- Make them engaging and SEO-optimized
- Include "${targetYear}" in at least one title
- Focus on completeness and authority
- Emphasize value to the reader

Format your response EXACTLY like this:
1. First Title Here (with "Ultimate Guide" and year)
2. Second Title Here (with "Complete Resource")
3. Third Title Here (with "Comprehensive" or similar)

CRITICAL:
- Return EXACTLY 3 numbered titles
- Use numbers and periods exactly as shown above
- Do not include any other text or explanation
- Each title must be unique and relevant
- First title MUST include both "Ultimate Guide" and the year ${targetYear}
- Each title should convey comprehensiveness and authority`
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
      ? `Generate additional relevant hashtags for ${platform} based on: ${keywords.join(', ')}

Requirements:
- Generate EXACTLY 10 relevant hashtags
- Mix trending and niche hashtags
- Focus on ${platform} best practices
- Include related industry terms
- Include audience interest tags
- Maximum ${PLATFORM_LIMITS[platform].hashtags} can be used
- Do not repeat the original hashtags

Format your response as a comma-separated list.
Include the # symbol with each hashtag.
Do not number the items.
Do not include any other text or explanation.`
      : `Generate exactly 15 LSI keywords and phrases related to: ${keywords.join(', ')}
        - Include semantic variations and related terms
        - Mix of short-tail and long-tail phrases
        - Focus on high-search-volume terms
        - Ensure relevance to main topic
        - Avoid exact matches to the original keywords
        - Include trending industry terms
        - Mix of broad and specific phrases
        
        CRITICAL FORMATTING INSTRUCTIONS:
        - Output EXACTLY 15 unique keywords/phrases as comma-separated list
        - Do not number the items
        - Do not include the original keywords
        - Do not include ANY additional text, explanations, or content
        - Do not include headers, titles, or sections
        - Return ONLY the comma-separated list of keywords
        - Do not write a comprehensive guide or article`
  }),

  generateOutline: (contentType: string, topic: string, title: string, platform?: Platform, metadata?: any): ChatMessage => ({
    role: 'user' as const,
    content: contentType === 'Email Sequence' && metadata
      ? `Create an outline for an email sequence titled "${title}" about ${topic} for ${metadata.companyName}.

Requirements:
- Create EXACTLY ${metadata.emailCount} emails (no more, no less)
- Target audience: ${metadata.targetAudience}
- Each email should have a clear purpose and call-to-action
- Include subject line suggestions for each email
- Maintain consistent branding and tone for ${metadata.companyName}
- Include ${metadata.companyName} in appropriate places

Format your response in this EXACT structure:
[H1] Email Sequence Overview
[LIST]
- Target Audience: ${metadata.targetAudience}
- Number of Emails: ${metadata.emailCount}
- Company: ${metadata.companyName}
- Sequence Goal: [Based on topic]

[H1] Email 1: Welcome to ${metadata.companyName}
[H2] Subject Line Options
[LIST]
- Option 1: [Subject line with ${metadata.companyName}]
- Option 2: [Alternative subject line]
[H2] Email Content Structure
[LIST]
- Opening hook
- Main message
- Call to action

[Continue this pattern for each email, numbered 1 to ${metadata.emailCount} exactly]

CRITICAL:
- Create EXACTLY ${metadata.emailCount} email outlines, no more, no less
- Number emails from 1 to ${metadata.emailCount}
- Use ONLY these prefixes: [H1], [H2], [LIST]
- Each email section must include subject lines and content structure
- Include ${metadata.companyName} in appropriate places
- Focus on the specific needs of ${metadata.targetAudience}`
      : contentType === 'Social Media Post'
      ? `Create a structured outline for a ${platform} post about "${topic}" with title "${title}":

Requirements:
- Follow ${platform} best practices and character limits
- Focus on engaging, platform-native content
- Include essential components for ${platform}

Format your response in this EXACT structure:
[H1] Opening Hook
[LIST]
- Attention-grabbing question or statement
- Relevant emoji placement

[H2] Main Message
[LIST]
- Core value proposition
- Key benefit or insight

[H2] Supporting Details
[LIST]
- Important point 1
- Important point 2
- Relevant statistics or examples

[H2] Call to Action
[LIST]
- Clear action step
- Engagement prompt

[H2] Hashtag Strategy
[LIST]
- Strategic hashtag placement
- Platform-specific recommendations`
      : contentType === 'Listicle'
      ? `Create a detailed outline for a listicle titled "${title}" about ${topic}.

Requirements:
- Include 10-15 list items (each as an H2 section)
- Each list item should have 3-5 key points with detailed explanations
- Each list item should be substantial (100-150 words each)
- Include a comprehensive introduction (200-250 words) and conclusion (150-200 words)
- Maintain a consistent format for each list item
- Plan for a total content length of 1200-1500 words minimum
- Focus on providing valuable, actionable information with examples
- Include practical applications or real-world examples for each list item

Format your response in this EXACT structure:
[H1] Introduction
[LIST] 
- Hook to grab reader's attention
- Why this list is valuable
- What readers will learn
- Overview of the problem or need this listicle addresses

[H2] 1. [First List Item Title]
[LIST]
- Key point about this item
- Why it's important or useful
- Example or application
- Practical implementation tips
- Supporting evidence or statistics

[H2] 2. [Second List Item Title]
[LIST]
- Key point about this item
- Why it's important or useful
- Example or application
- Practical implementation tips
- Supporting evidence or statistics

[Continue this pattern for all list items, numbered 1 to 10-15]

[H1] Conclusion
[LIST]
- Summary of key takeaways
- Final thoughts or recommendations
- Call to action
- Next steps for the reader

CRITICAL:
- Use ONLY these prefixes: [H1], [H2], [LIST], [CTA]
- Each list item must be numbered in the H2 heading (e.g., "1. Item Title")
- Keep format consistent across all list items
- Include 10-15 list items total (no more, no less)
- Make sure each list item is unique and valuable`
      : contentType === 'Resource Guide'
      ? `Create a detailed outline for a comprehensive resource guide titled "${title}" about ${topic}.

Requirements:
- Include 7-10 main resource categories (as H1 sections)
- Each category should have 4-6 specific resources or recommendations
- Each resource should have a detailed description (50-75 words)
- Include explanations of why each resource is valuable and how to use it
- Include a comprehensive introduction (200-250 words) and conclusion (150-200 words)
- Organize resources by type, skill level, or use case
- Plan for a total content length of 1200-1500 words minimum
- Include practical implementation advice for each resource category

Format your response in this EXACT structure:
[H1] Introduction to ${topic}
[LIST] 
- Overview of the guide's purpose
- Who this resource guide is for
- How to use this guide effectively
- Why these resources are essential for success in this area

[H1] [First Resource Category]
[H2] Overview of this Category
[LIST]
- Why these resources are important
- How to choose the right resource
- What to expect from these resources
- Who will benefit most from these resources

[H2] Top Resources in this Category
[LIST]
- Resource 1: [Name] - [Detailed description of value, features, and implementation]
- Resource 2: [Name] - [Detailed description of value, features, and implementation]
- Resource 3: [Name] - [Detailed description of value, features, and implementation]
- Resource 4: [Name] - [Detailed description of value, features, and implementation]
- Resource 5: [Name] - [Detailed description of value, features, and implementation]

[Continue this pattern for all resource categories]

[H1] How to Get Started
[LIST]
- Recommended first steps
- Beginner-friendly resources
- Common pitfalls to avoid
- Implementation strategy

[H1] Conclusion
[LIST]
- Summary of key resources
- Final recommendations
- Call to action
- Next steps for implementation

CRITICAL:
- Use ONLY these prefixes: [H1], [H2], [LIST], [CTA]
- Each resource must include both name and detailed value description
- Organize resources in a logical, user-friendly way
- Include 7-10 main resource categories total
- Make sure each resource is relevant and valuable`
      : `Create a detailed outline for ${contentType} titled "${title}" about ${topic}.

Requirements:
- Include 7-10 main sections (H1 headings)
- Each section must have 3-5 subsections or points (H2 headings)
- Each subsection should have enough detail for 150-200 words of content
- Include a comprehensive introduction and conclusion (200-250 words each)
- Maintain logical flow and thorough coverage of the topic
- Plan for a total content length of 1200-1500 words minimum
- Include a mix of different content types (headings, lists, CTAs)
- Focus on in-depth value delivery with detailed explanations

Format your response in this EXACT structure:
[H1] Introduction
[H2] Hook Statement
[LIST] 
- Key problem point
- Current market situation
- Reader's pain points
- Scope of the article (what will be covered)

[H1] [Section Title]
[H2] Main Point
[LIST]
- Supporting detail
- Example or case study
- Statistical evidence
- Practical application

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

// Helper function to count words in a string
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Update the generateContent function signature
export async function generateContent(messages: ChatMessage[]) {
  try {
    const messageContent = messages[0].content.toLowerCase();
    
    // For LSI keyword generation
    if (messageContent.includes('generate exactly 15 lsi keywords') || messageContent.includes('generate additional relevant hashtags')) {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system' as const,
            content: 'You are a keyword research specialist. When asked to generate keywords or hashtags, respond ONLY with a comma-separated list of keywords or hashtags. Do not include any explanations, introductions, or additional content.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      });

      return { content: response.choices[0].message.content || '' };
    }
    
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
    let attempts = 0;
    let generatedContent = '';
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system' as const,  
            content: `Create high-quality, engaging content that is:
            1. Well-structured with proper HTML tags
            2. SEO-optimized with comprehensive coverage of the topic
            3. Audience-focused and valuable
            4. Detailed and thorough with a minimum of 1200-1500 words
            5. Properly formatted with appropriate section lengths
            6. In-depth with multiple examples and supporting points
            7. Comprehensive with thorough explanations of each concept
            8. DO NOT use markdown code fence markers (like \`\`\`html or \`\`\`)
            9. Return content directly as clean HTML without any wrappers or markers${attempts > 0 ? '\n10. IMPORTANT: The previous content was too short. Please create a more comprehensive version with AT LEAST 1500 words.' : ''}`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: SEO_CONFIG.maxTokens,
        top_p: 0.9
      });

      generatedContent = response.choices[0].message.content || '';
      const wordCount = countWords(generatedContent);
      
      console.log(`Generated content word count: ${wordCount}`);
      
      // If content meets minimum word count or we've reached max attempts, return it
      if (wordCount >= SEO_CONFIG.minWords || attempts >= maxAttempts - 1) {
        break;
      }
      
      // Otherwise, try again with a more explicit instruction
      attempts++;
      console.log(`Content too short (${wordCount} words). Attempting regeneration...`);
      
      // Add the length requirement to the user message for the next attempt
      messages = [
        ...messages,
        {
          role: 'user' as const,
          content: `The content you generated was too short (only ${wordCount} words). Please create a more comprehensive version with AT LEAST ${SEO_CONFIG.minWords} words. Expand each section with more details, examples, and explanations.`
        }
      ];
    }

    return { content: generatedContent };
  } catch (error: any) {
    console.error('Content generation error:', error);
    throw new Error(error.message || 'Failed to generate content. Please try again.');
  }
}