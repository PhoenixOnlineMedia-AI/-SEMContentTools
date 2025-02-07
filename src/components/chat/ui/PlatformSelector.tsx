import React from 'react';
import { Instagram, Twitter, Linkedin, Facebook, MessageCircle, Video } from 'lucide-react';
import { PLATFORM_LIMITS, VIDEO_LIMITS } from '../configs/platforms';
import type { Platform } from '../../../lib/deepseek';

interface PlatformOption {
  name: Platform;
  icon: React.ElementType;
  description: string;
  color: string;
}

const socialPlatforms: PlatformOption[] = [
  {
    name: 'Instagram',
    icon: Instagram,
    description: `Up to ${PLATFORM_LIMITS.Instagram.chars} characters, ${PLATFORM_LIMITS.Instagram.hashtags} hashtags`,
    color: 'pink'
  },
  {
    name: 'Twitter/X',
    icon: Twitter,
    description: `Up to ${PLATFORM_LIMITS['Twitter/X'].chars} characters, ${PLATFORM_LIMITS['Twitter/X'].hashtags} hashtags`,
    color: 'blue'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    description: `Up to ${PLATFORM_LIMITS.LinkedIn.chars} characters, ${PLATFORM_LIMITS.LinkedIn.hashtags} hashtags`,
    color: 'indigo'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    description: `Up to ${PLATFORM_LIMITS.Facebook.chars} characters, ${PLATFORM_LIMITS.Facebook.hashtags} hashtags`,
    color: 'blue'
  },
  {
    name: 'Threads',
    icon: MessageCircle,
    description: `Up to ${PLATFORM_LIMITS.Threads.chars} characters, ${PLATFORM_LIMITS.Threads.hashtags} hashtags`,
    color: 'gray'
  }
];

const videoPlatforms: PlatformOption[] = [
  {
    name: 'YouTube',
    icon: Video,
    description: `${VIDEO_LIMITS.YouTube.minLength}-${VIDEO_LIMITS.YouTube.maxLength} minutes`,
    color: 'red'
  },
  {
    name: 'TikTok',
    icon: Video,
    description: `${VIDEO_LIMITS.TikTok.minLength}-${VIDEO_LIMITS.TikTok.maxLength} minutes`,
    color: 'purple'
  },
  {
    name: 'Explainer',
    icon: Video,
    description: `${VIDEO_LIMITS.Explainer.minLength}-${VIDEO_LIMITS.Explainer.maxLength} minutes`,
    color: 'blue'
  }
];

interface PlatformSelectorProps {
  contentType: string;
  onSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ contentType, onSelect }) => {
  const platforms = contentType === 'Video Script' ? videoPlatforms : socialPlatforms;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {platforms.map(({ name, icon: Icon, description, color }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left space-y-3 border border-gray-100 hover:border-${color}-500 bg-white group`}
        >
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-medium text-gray-900 group-hover:text-${color}-600`}>
              {name}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {description}
          </p>
        </button>
      ))}
    </div>
  );
};