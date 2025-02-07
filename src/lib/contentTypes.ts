import { FileText, Share2, Layout, FileCode2, Mail, Video, ListOrdered, BookOpen, MapPin, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ContentTypeConfig {
  type: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const contentTypeCards: ContentTypeConfig[] = [
  {
    type: 'Blog Post',
    icon: FileText,
    description: 'In-depth articles and thought leadership content',
    color: 'blue'
  },
  {
    type: 'Social Media Post',
    icon: Share2,
    description: 'Engaging content for social platforms',
    color: 'purple'
  },
  {
    type: 'Landing Page',
    icon: Layout,
    description: 'Conversion-focused pages to drive action',
    color: 'green'
  },
  {
    type: 'Service Page',
    icon: FileCode2,
    description: 'Showcase your services and expertise',
    color: 'indigo'
  },
  {
    type: 'Email Sequence',
    icon: Mail,
    description: 'Nurture leads with targeted email series',
    color: 'pink'
  },
  {
    type: 'Video Script',
    icon: Video,
    description: 'Compelling scripts for video content',
    color: 'red'
  },
  {
    type: 'Listicle',
    icon: ListOrdered,
    description: 'Engaging list-based articles',
    color: 'amber'
  },
  {
    type: 'Resource Guide',
    icon: BookOpen,
    description: 'Comprehensive guides and resources',
    color: 'teal'
  }
];

export interface LocationToggleConfig {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const locationToggleCards: LocationToggleConfig[] = [
  {
    value: 'yes',
    title: 'Yes, Location-Specific',
    description: 'Service targets specific geographic areas',
    icon: MapPin,
    color: 'green'
  },
  {
    value: 'no',
    title: 'No, Location-Independent',
    description: 'Service available everywhere',
    icon: Globe,
    color: 'blue'
  }
];