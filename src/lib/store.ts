import { create } from 'zustand';
import { supabase } from './supabase';
import { generateContent, contentPrompts, type Platform } from './deepseek';
import { plans, type PlanId } from './plans';

interface UsageInfo {
  contentCount: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

// Add new types for outline structure
export interface OutlineItem {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'list' | 'cta';
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
  | 'target-audience';

export const contentTypeSteps: Record<ContentType, Step[]> = {
  'Blog Post': ['topic', 'title', 'keywords', 'lsi', 'outline', 'content'],
  'Service Page': ['topic', 'location-toggle', 'service-location', 'local-keywords', 'title', 'content'],
  'Social Media Post': ['platform', 'topic', 'hashtags', 'lsi', 'content'],
  'Email Sequence': ['topic', 'email-count', 'target-audience', 'title', 'content'],
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
  generateTitleSuggestions: () => Promise<void>;
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
  setStep: (step) => set({ step }),
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
      selectedKeywords: newState.selectedKeywords,
      keywords: newState.keywords,
      hasContent: !!newState.content,
      contentLength: newState.content.length
    });
  },
  setOutline: (outline) => set({ outline }),
  setContent: (content) => {
    console.log('Content update requested:', {
      length: content?.length,
      preview: content?.substring(0, 100),
      type: typeof content,
      isString: typeof content === 'string',
      isEmpty: !content,
      stack: new Error().stack
    });
    
    // Ensure we always store a string, even if empty
    const normalizedContent = (typeof content === 'string') ? content : '';
    
    // Update content first
    set((state) => ({ 
      ...state,
      content: normalizedContent 
    }));
    
    // Log the state after update
    const newState = get();
    console.log('Store state after content update:', {
      contentLength: newState.content.length,
      contentPreview: newState.content.substring(0, 100),
      hasContent: !!newState.content,
      keywordsCount: newState.keywords.length,
      keywords: newState.keywords,
      selectedKeywordsCount: newState.selectedKeywords.length,
      selectedKeywords: newState.selectedKeywords
    });
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

      // Validate subscription
      if (!profile || profile.subscription_status !== 'active') {
        console.error('No active subscription found');
        return false;
      }

      const planDetails = plans[profile.subscription_tier?.toLowerCase() as PlanId];
      if (!planDetails?.limit) {
        console.error('Invalid plan configuration for:', profile.subscription_tier);
        return false;
      }

      // Get subscription period
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('created_at, current_period_end')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const periodStart = subscription?.created_at || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const periodEnd = subscription?.current_period_end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

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
        planId: profile.subscription_tier,
        periodStart,
        periodEnd,
        credits: profile.credits
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

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, credits')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) throw new Error('No active subscription found');
      if (profile.subscription_status !== 'active') throw new Error('Subscription is not active');

      const planDetails = plans[profile.subscription_tier?.toLowerCase() as PlanId];
      if (!planDetails?.limit) throw new Error('Invalid plan configuration');

      // Get subscription period
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('created_at, current_period_end')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const periodStart = subscription?.created_at || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const periodEnd = subscription?.current_period_end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

      // Insert new content record
      const { error: insertError } = await supabase
        .from('user_content')
        .insert({
          user_id: session.user.id,
          content_type: get().contentType,
          topic: get().topic,
          title: get().title,
          outline: get().outline,
          keywords: get().selectedKeywords,
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

  generateTitleSuggestions: async () => {
    const { contentType, topic, platform } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await generateContent([
        contentPrompts.generateTitle(contentType, topic, platform as Platform)
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
      const lsiKeywords = response.content
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

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
    const { contentType, topic, title, platform } = get();
    
    try {
      set({ isLoading: true, error: null });
      
      const response = await generateContent([
        contentPrompts.generateOutline(contentType, topic, title, platform as Platform)
      ]);

      if (!response.content) {
        throw new Error('Failed to generate outline');
      }

      if (contentType === 'Social Media Post') {
        try {
          // Parse the JSON structure for social media posts
          const jsonOutline = JSON.parse(response.content);
          const outline: OutlineItem[] = [
            {
              id: crypto.randomUUID(),
              type: 'h1',
              content: jsonOutline.structure.hook
            },
            {
              id: crypto.randomUUID(),
              type: 'h2',
              content: jsonOutline.structure.body
            },
            {
              id: crypto.randomUUID(),
              type: 'list',
              content: 'Key Points',
              items: Array.isArray(jsonOutline.structure.details) 
                ? jsonOutline.structure.details 
                : jsonOutline.structure.details.split('\n')
            },
            {
              id: crypto.randomUUID(),
              type: 'cta',
              content: jsonOutline.structure.cta
            },
            {
              id: crypto.randomUUID(),
              type: 'list',
              content: 'Media References',
              items: Array.isArray(jsonOutline.structure.media)
                ? jsonOutline.structure.media
                : [jsonOutline.structure.media]
            },
            {
              id: crypto.randomUUID(),
              type: 'h2',
              content: jsonOutline.structure.hashtags
            }
          ];
          set({ outline, isLoading: false });
        } catch (error) {
          console.error('Error parsing social media outline:', error);
          set({ 
            error: 'Failed to parse social media outline',
            isLoading: false 
          });
        }
      } else {
        // Existing outline parsing logic for other content types
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
      }
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
    // Implementation needed for draft content generation
    throw new Error('Not implemented');
  },

  saveContent: async () => {
    // Implementation needed for content saving
    throw new Error('Not implemented');
  },

  addOutlineSection: (type, parentId) => {
    // Implementation needed
  }
}));