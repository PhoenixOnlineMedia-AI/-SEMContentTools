import { FileText, Share2, Layout, FileCode2, Mail, Video, ListOrdered, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentType } from '../../../lib/store';

export interface ContentTypeConfig {
  type: ContentType;
  icon: LucideIcon;
  description: string;
  color: string;
  examples: string[];
}

// Note: Social Media Post and Video Script types are temporarily hidden from the UI
// but their handlers and functionality are preserved for future use
export const contentTypeCards: ContentTypeConfig[] = [
  {
    type: 'Blog Post',
    icon: FileText,
    description: 'In-depth articles optimized for SEO and engagement',
    color: 'blue',
    examples: [
      'How-to guides',
      'Industry insights',
      'Product comparisons'
    ]
  },
  {
    type: 'Landing Page',
    icon: Layout,
    description: 'High-converting pages with clear value propositions',
    color: 'green',
    examples: [
      'Product launches',
      'Service offerings',
      'Lead magnets'
    ]
  },
  {
    type: 'Service Page',
    icon: FileCode2,
    description: 'Location-aware service descriptions with SEO focus',
    color: 'indigo',
    examples: [
      'Local business services',
      'Professional offerings',
      'Service packages'
    ]
  },
  {
    type: 'Email Sequence',
    icon: Mail,
    description: 'Targeted email series for nurturing leads',
    color: 'pink',
    examples: [
      'Welcome sequences',
      'Product launches',
      'Abandoned cart recovery'
    ]
  },
  {
    type: 'Listicle',
    icon: ListOrdered,
    description: 'Engaging list-based articles with rich examples',
    color: 'amber',
    examples: [
      'Top 10 lists',
      'Best practices',
      'Tips and tricks'
    ]
  },
  {
    type: 'Resource Guide',
    icon: BookOpen,
    description: 'Comprehensive guides with actionable insights',
    color: 'teal',
    examples: [
      'Ultimate guides',
      'Industry resources',
      'Step-by-step tutorials'
    ]
  }
];