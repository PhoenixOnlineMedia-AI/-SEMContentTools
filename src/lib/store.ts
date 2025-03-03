import { create } from 'zustand';
import { supabase } from './supabase';
import { generateContent, contentPrompts, type Platform } from './deepseek';
import { plans, type PlanId } from './plans';
import { ServicePageHandler } from '../components/chat/handlers/ServicePageHandler';

interface UsageInfo {
  contentCount: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

// Add new types for outline structure
export interface OutlineItem {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'list' | 'cta' | 'metadata';
  content: string;
  items?: string[];
}

export type ContentType = 
  | 'Blog Post'
  | 'Social Media Post'
  | 'Landing Page'
  | 'Service Page'
  | 'Email Sequence'
  | 'Video Script'
  | 'Listicle'
  | 'Resource Guide';

export type Step = 
  | 'type'
  | 'topic'
  | 'title'
  | 'keywords'
  | 'lsi'
  | 'outline'
  | 'content'
  | 'service-location'
  | 'location-toggle'
  | 'local-keywords'
  | 'platform'
  | 'hashtags'
  | 'email-count'
  | 'target-audience'
  | 'business-name'
  | 'service-area'
  | 'company-name';

export const contentTypeSteps: Record<ContentType, Step[]> = {
  'Blog Post': ['topic', 'title', 'keywords', 'lsi', 'outline', 'content'],
  'Service Page': ['topic', 'business-name', 'location-toggle', 'service-location', 'service-area', 'target-audience', 'keywords', 'lsi', 'title', 'outline', 'content'],
  'Social Media Post': ['platform', 'topic', 'title', 'hashtags', 'lsi', 'outline', 'content'],
  'Email Sequence': ['topic', 'email-count', 'company-name', 'target-audience', 'title', 'outline', 'content'],
  'Landing Page': ['topic', 'title', 'keywords', 'lsi', 'outline', 'content'],
  'Video Script': ['platform', 'topic', 'title', 'outline', 'content'],
  'Listicle': ['topic', 'title', 'keywords', 'lsi', 'outline', 'content'],
  'Resource Guide': ['topic', 'title', 'keywords', 'lsi', 'outline', 'content']
};

export interface ContentState {
  step: Step;
  contentType: ContentType | '';
  platform: Platform | '';
  topic: string;
  title: string;
  titleSuggestions: string[];
  keywords: string[];
  lsiKeywords: string[];
  selectedKeywords: string[];
  outline: OutlineItem[];
  content: string;
  metaDescription: string;
  currentId: string | null;
  isLoading: boolean;
  error: string | null;
  usageInfo: UsageInfo | null;
  message: string | null;
  serviceLocation: string;
  localKeywords: string[];
  emailCount: number;
  targetAudience: string;

  setStep: (step: Step) => void;
  setContentType: (type: ContentType | '') => void;
  setPlatform: (platform: Platform | '') => void;
  setTopic: (topic: string) => void;
  setTitle: (title: string) => void;
  setKeywords: (keywords: string[]) => void;
  setLSIKeywords: (keywords: string[]) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  setOutline: (outline: OutlineItem[]) => void;
  setContent: (content: string) => void;
  setMetaDescription: (description: string) => void;
  setCurrentId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setServiceLocation: (location: string) => void;
  setLocalKeywords: (keywords: string[]) => void;
  setEmailCount: (count: number) => void;
  setTargetAudience: (audience: string) => void;

  checkUsageLimit: () => Promise<boolean>;
  incrementUsage: () => Promise<void>;
  generateTitleSuggestions: (metadata?: any) => Promise<void>;
  generateLSIKeywords: (keywords: string[]) => Promise<void>;
  generateOutline: () => Promise<void>;
  generateDraftContent: () => Promise<void>;
  saveContent: () => Promise<void>;
  addOutlineSection: (type: OutlineItem['type'], parentId?: string) => void;
}

interface ContentRecord {
  id: string;
  content_type: ContentType;
  topic: string;
  title: string;
  outline: OutlineItem[];
  content: string;
  keywords: string[];
  meta_description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  step: 'type',
  contentType: '',
  platform: '',
  topic: '',
  title: '',
  titleSuggestions: [],
  keywords: [],
  lsiKeywords: [],
  selectedKeywords: [],
  outline: [],
  content: '',
  metaDescription: '',
  currentId: null,
  isLoading: false,
  error: null,
  usageInfo: null,
  message: null,
  serviceLocation: '',
  localKeywords: [],
  emailCount: 1,
  targetAudience: '',

  // Setters
  setStep: (step) => {
    console.log('Setting step:', {
      newStep: step,
      currentState: get()
    });
    
    set((state) => {
      // Clear error when changing steps
      const updates: Partial<ContentState> = { step, error: null };
      
      // Reset specific state based on step changes
      if (step === 'type') {
        updates.contentType = '' as ContentType | '';
        updates.platform = '';
        updates.topic = '';
        updates.title = '';
        updates.keywords = [];
        updates.lsiKeywords = [];
        updates.selectedKeywords = [];
        updates.outline = [];
        updates.content = '';
      }
      
      // Clear input-related state when moving to a new input step
      if (['topic', 'title', 'hashtags'].includes(step)) {
        updates.error = null;
      }
      
      return { ...state, ...updates };
    });
  },
  setContentType: (type) => {
    if (type === '') {
      set({
        contentType: '',
        step: 'type',
        topic: '',
        title: '',
        keywords: [],
        lsiKeywords: [],
        outline: [],
        content: '',
        serviceLocation: '',
        localKeywords: [],
        platform: '',
        emailCount: 1,
        targetAudience: '',
        error: null
      });
      return;
    }
    
    set({ 
      contentType: type,
      step: contentTypeSteps[type][0],
      // Reset all state when changing content type
      topic: '',
      title: '',
      keywords: [],
      lsiKeywords: [],
      outline: [],
      content: '',
      serviceLocation: '',
      localKeywords: [],
      platform: '',
      emailCount: 1,
      targetAudience: '',
      error: null
    });
  },
  setPlatform: (platform) => set({ platform }),
  setTopic: (topic) => set({ topic }),
  setTitle: (title) => set({ title }),
  setKeywords: (keywords) => {
    console.log('Keywords update requested:', {
      keywords,
      count: keywords?.length,
      stack: new Error().stack
    });
    
    // Update keywords
    set((state) => ({ 
      ...state,
      keywords: keywords || [] 
    }));
    
    // Log the state after update
    const newState = get();
    console.log('Store state after keywords update:', {
      keywords: newState.keywords,
      selectedKeywords: newState.selectedKeywords,
      hasContent: !!newState.content,
      contentLength: newState.content.length
    });
  },
  setLSIKeywords: (keywords) => set({ lsiKeywords: keywords }),
  setSelectedKeywords: (keywords) => {
    console.log('Selected keywords update requested:', {
      keywords,
      count: keywords?.length,
      stack: new Error().stack
    });
    
    // Update selected keywords
    set((state) => ({ 
      ...state,
      selectedKeywords: keywords || [] 
    }));
    
    // Log the state after update
    const newState = get();
    console.log('Store state after selected keywords update:', {
      keywords: newState.keywords,
      selectedKeywords: newState.selectedKeywords,
      hasContent: !!newState.content,
      contentLength: newState.content.length
    });
  },
  setOutline: (outline) => set({ outline }),
  setContent: (content) => {
    const normalizedContent = content || '';
    const currentState = get();
    
    // Skip empty content updates unless explicitly setting to empty
    if (!normalizedContent && currentState.content && !content) {
      console.log('Skipping empty content update');
      return;
    }
    
    // Only update if content has actually changed
    if (currentState.content !== normalizedContent) {
      console.log('Content update:', {
        currentLength: currentState.content?.length || 0,
        newLength: normalizedContent.length,
        hasChanged: true,
        isEmpty: !normalizedContent
      });
      
      set((state) => ({
        ...state,
        content: normalizedContent,
        error: null
      }));
    } else {
      console.log('Content unchanged, skipping update');
    }
  },
  setMetaDescription: (description) => set({ metaDescription: description }),
  setCurrentId: (id) => set({ currentId: id }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setServiceLocation: (location) => set({ serviceLocation: location }),
  setLocalKeywords: (keywords) => set({ localKeywords: keywords }),
  setEmailCount: (count) => set({ emailCount: count }),
  setTargetAudience: (audience) => set({ targetAudience: audience }),

  // Usage tracking
  checkUsageLimit: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return false;
      }

      // Get user's profile and subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, credits')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return false;
      }

      // Default to free plan if no active subscription
      const planDetails = profile?.subscription_tier ? 
        plans[profile.subscription_tier.toLowerCase() as PlanId] : 
        plans['free'];

      if (!planDetails?.limit) {
        console.error('Invalid plan configuration');
        return false;
      }

      // Get current period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Get current usage within the period
      const { data: usage, error: usageError } = await supabase
        .from('user_content')
        .select('id, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        return false;
      }

      const contentCount = usage?.length || 0;
      console.log('Current usage:', {
        contentCount,
        limit: planDetails.limit,
        planId: profile?.subscription_tier || 'free',
        periodStart,
        periodEnd
      });

      // Update usage info in state
      set({
        usageInfo: {
          contentCount,
          limit: planDetails.limit,
          periodStart,
          periodEnd
        }
      });

      // Return true if user has credits remaining
      const hasCredits = contentCount < planDetails.limit;
      if (!hasCredits) {
        set({ error: `Content limit reached: ${contentCount}/${planDetails.limit} pieces used this month` });
      } else {
        set({ 
          error: null,
          message: `${contentCount}/${planDetails.limit} pieces used this month (${planDetails.limit - contentCount} remaining)`
        });
      }
      return hasCredits;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      set({ error: 'Failed to check content limit. Please try again.' });
      return false;
    }
  },

  incrementUsage: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const state = get();
      
      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, credits')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw new Error('Error fetching profile');

      // Default to free plan if no active subscription
      const planDetails = profile?.subscription_tier ? 
        plans[profile.subscription_tier.toLowerCase() as PlanId] : 
        plans['free'];

      if (!planDetails?.limit) throw new Error('Invalid plan configuration');

      // Get current period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Insert new content record with all required fields
      const { error: insertError } = await supabase
        .from('user_content')
        .insert({
          user_id: session.user.id,
          content_type: state.contentType,
          topic: state.topic,
          title: state.title || state.topic, // Use topic as fallback if title is empty
          outline: state.outline,
          content: state.content,
          keywords: state.selectedKeywords,
          meta_description: state.metaDescription || state.topic, // Use topic as fallback if meta description is empty
          platform: state.platform || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Get updated usage count
      const { data: usage, error: usageError } = await supabase
        .from('user_content')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      if (usageError) throw usageError;

      const contentCount = usage?.length || 0;

      // Update usage info in state
      set({
        usageInfo: {
          contentCount,
          limit: planDetails.limit,
          periodStart,
          periodEnd
        }
      });

      // Show remaining credits message
      set({ 
        error: null,
        message: `${contentCount}/${planDetails.limit} pieces used this month`
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
      set({ error: 'Failed to increment usage. Please try again.' });
    }
  },

  generateTitleSuggestions: async (metadata?: any) => {
    const { contentType, topic, platform } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await generateContent([
        contentPrompts.generateTitle(contentType, topic, platform as Platform, metadata)
      ]);

      if (!response.content) {
        throw new Error('Failed to generate title suggestions');
      }

      // Parse the numbered list response
      const titles = response.content
        .split('\n')
        .filter(line => /^\d+\./.test(line))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      set({ titleSuggestions: titles });
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error generating titles:', error);
      set({ 
        error: error.message || 'Failed to generate title suggestions',
        isLoading: false 
      });
      throw error;
    }
  },

  generateLSIKeywords: async (keywords: string[]) => {
    const { contentType, platform } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await generateContent([
        contentPrompts.generateLSIKeywords(keywords, platform as Platform)
      ]);

      if (!response.content) {
        throw new Error('Failed to generate LSI keywords');
      }

      // Parse the comma-separated response
      // First, clean the response to ensure we only get keywords
      let cleanedResponse = response.content;
      
      // Remove any headers or explanations that might be present
      if (cleanedResponse.includes('\n')) {
        // If there are multiple lines, look for a line that appears to be a comma-separated list
        const lines = cleanedResponse.split('\n');
        for (const line of lines) {
          if (line.includes(',') && !line.startsWith('#') && !line.startsWith('-')) {
            cleanedResponse = line;
            break;
          }
        }
      }
      
      // Extract just the comma-separated list if there's additional text
      const commaListMatch = cleanedResponse.match(/([^,.]+(?:,[^,.]+)+)/);
      if (commaListMatch) {
        cleanedResponse = commaListMatch[0];
      }
      
      const lsiKeywords = cleanedResponse
        .split(',')
        .map(k => k.trim())
        .filter(Boolean)
        .slice(0, 15); // Ensure we only take up to 15 keywords

      console.log('Parsed LSI keywords:', lsiKeywords);
      set({ lsiKeywords, isLoading: false });
    } catch (error: any) {
      console.error('Error generating LSI keywords:', error);
      set({ 
        error: error.message || 'Failed to generate LSI keywords',
        isLoading: false 
      });
      throw error;
    }
  },

  generateOutline: async () => {
    const { contentType, topic, title, platform, outline } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      // For service pages, use the metadata from the outline
      if (contentType === 'Service Page' && outline[0]?.type === 'metadata') {
        const metadata = JSON.parse(outline[0].content);
        const handler = new ServicePageHandler();
        const locationBasedOutline = handler.generateLocationBasedOutline(metadata);
        set({ outline: locationBasedOutline, isLoading: false });
        return;
      }
      
      const response = await generateContent([
        contentPrompts.generateOutline(contentType, topic, title, platform as Platform)
      ]);

      if (!response.content) {
        throw new Error('Failed to generate outline');
      }

      // Use the same parsing logic for all content types since they now use the same format
      const sections = response.content
        .split(/\[H1\]/)
        .filter(Boolean)
        .map(section => {
          const lines = section.trim().split('\n').filter(Boolean);
          const mainTitle = lines[0].trim();
          const outline: OutlineItem[] = [{
            id: crypto.randomUUID(),
            type: 'h1',
            content: mainTitle
          }];

          let currentItem: OutlineItem | null = null;

          lines.slice(1).forEach(line => {
            if (line.startsWith('[H2]')) {
              const item: OutlineItem = {
                id: crypto.randomUUID(),
                type: 'h2',
                content: line.replace('[H2]', '').trim()
              };
              outline.push(item);
              currentItem = item;
            } else if (line.startsWith('[LIST]')) {
              const item: OutlineItem = {
                id: crypto.randomUUID(),
                type: 'list',
                content: 'List Items',
                items: []
              };
              outline.push(item);
              currentItem = item;
            } else if (line.startsWith('[CTA]')) {
              const item: OutlineItem = {
                id: crypto.randomUUID(),
                type: 'cta',
                content: line.replace('[CTA]', '').trim()
              };
              outline.push(item);
              currentItem = item;
            } else if (line.startsWith('-') && currentItem?.type === 'list') {
              currentItem.items = currentItem.items || [];
              currentItem.items.push(line.replace('-', '').trim());
            }
          });

          return outline;
        })
        .flat();

      set({ outline: sections, isLoading: false });
    } catch (error: any) {
      console.error('Error generating outline:', error);
      set({ 
        error: error.message || 'Failed to generate outline',
        isLoading: false 
      });
      throw error;
    }
  },

  generateDraftContent: async () => {
    const { contentType, topic, title, outline, platform, selectedKeywords } = get();
    
    try {
      set({ isLoading: true, error: null });

      // Ensure we have a title before proceeding
      if (!title) {
        set({ title: topic }); // Use topic as fallback title
      }

      // Format the outline into a structured prompt
      let outlineText = '';
      outline.forEach(item => {
        switch (item.type) {
          case 'h1':
            outlineText += `\n# ${item.content}\n`;
            break;
          case 'h2':
            outlineText += `\n## ${item.content}\n`;
            break;
          case 'list':
            outlineText += '\n' + (item.items || []).map(li => `- ${li}`).join('\n') + '\n';
            break;
          case 'cta':
            outlineText += `\n[CTA] ${item.content}\n`;
            break;
        }
      });

      // Create the content generation prompt
      const prompt = `Create ${contentType} content about "${topic}" with title "${title || topic}".
      
Keywords: ${selectedKeywords.join(', ')}
${platform ? `Platform: ${platform}` : ''}

Content Structure:
${outlineText}

Requirements:
- Follow the outline structure exactly
- Maintain proper heading hierarchy
- Include all list items
- Keep CTAs actionable and engaging
- Optimize for SEO and readability
${platform ? `- Follow ${platform} best practices and character limits` : ''}

CRITICAL FORMAT REQUIREMENTS:
- Return content in clean HTML format
- Use proper semantic HTML tags (h1, h2, h3, p, ul, li, strong, em)
- Do not escape HTML tags
- Do not add extra divs or line breaks
- Do not include any styling or classes
- Do not include any scripts or external resources
- DO NOT use markdown code fence markers (like \`\`\`html or \`\`\`)
- Return content directly as clean HTML without any wrappers or markers
- Format should be clean, semantic HTML only`;

      const response = await generateContent([
        { role: 'user', content: prompt }
      ]);

      if (!response.content) {
        throw new Error('Failed to generate content');
      }

      // Clean up the response
      const cleanContent = response.content
        // Remove code fence markers
        .replace(/```html/g, '')
        .replace(/```/g, '')
        // Remove any escaped HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        // Remove unnecessary divs and line breaks
        .replace(/<\/?div>/g, '')
        .replace(/<br\s*\/?>/g, '')
        // Remove any empty lines
        .replace(/^\s*[\r\n]/gm, '')
        // Remove any remaining whitespace at start/end
        .trim();

      // Generate a meta description from the first paragraph
      const metaDescription = cleanContent
        .match(/<p>(.*?)<\/p>/)?.[1]
        ?.replace(/<[^>]+>/g, '')
        ?.substring(0, 160) || topic;

      set({ 
        content: cleanContent, 
        metaDescription,
        isLoading: false 
      });
      
      // Increment usage after successful generation
      await get().incrementUsage();
      
    } catch (error: any) {
      console.error('Error generating content:', error);
      set({ 
        error: error.message || 'Failed to generate content',
        isLoading: false 
      });
      throw error;
    }
  },

  saveContent: async () => {
    const state = get();
    try {
      console.log('Starting saveContent...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error('No authenticated session found');
        throw new Error('Not authenticated');
      }

      console.log('Saving content with data:', {
        contentType: state.contentType,
        hasTitle: !!state.title,
        hasContent: !!state.content,
        contentLength: state.content?.length,
        keywordsCount: state.selectedKeywords?.length,
        currentId: state.currentId,
        userId: session.user.id
      });

      const contentData = {
        user_id: session.user.id,
        content_type: state.contentType,
        topic: state.topic || '',
        title: state.title || state.topic || '',
        outline: state.outline || [],
        content: state.content || '',
        keywords: state.selectedKeywords || [],
        meta_description: state.metaDescription || state.topic || '',
        updated_at: new Date().toISOString()
      };

      let result;
      if (state.currentId) {
        // Update existing content
        console.log('Updating existing content with ID:', state.currentId);
        result = await supabase
          .from('user_content')
          .update(contentData)
          .eq('id', state.currentId);
      } else {
        // Insert new content
        console.log('Inserting new content');
        result = await supabase
          .from('user_content')
          .insert({
            ...contentData,
            created_at: new Date().toISOString()
          });
      }

      if (result.error) {
        console.error('Database operation error:', {
          error: result.error,
          status: result.status,
          statusText: result.statusText,
          data: result.data,
          count: result.count
        });
        throw result.error;
      }

      console.log('Content saved successfully:', {
        operation: state.currentId ? 'update' : 'insert',
        status: result.status,
        count: result.count
      });
    } catch (error: any) {
      console.error('Error in saveContent:', {
        error,
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error?.status,
        statusText: error?.statusText,
        stack: error.stack
      });
      throw new Error(`Failed to save content: ${error.message}`);
    }
  },

  addOutlineSection: (type, parentId) => {
    // Implementation needed
  }
}));