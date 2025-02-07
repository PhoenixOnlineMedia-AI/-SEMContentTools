export interface PlatformLimit {
  chars: number;
  hashtags: number;
}

export interface PlatformConfig {
  name: string;
  limits: PlatformLimit;
}

export const PLATFORM_LIMITS: Record<string, PlatformLimit> = {
  'Instagram': { chars: 2200, hashtags: 5 },
  'Twitter/X': { chars: 280, hashtags: 5 },
  'LinkedIn': { chars: 3000, hashtags: 5 },
  'Facebook': { chars: 63206, hashtags: 5 },
  'Pinterest': { chars: 500, hashtags: 5 },
  'Threads': { chars: 500, hashtags: 5 }
};

export const VIDEO_LIMITS = {
  'YouTube': { minLength: 3, maxLength: 15 },
  'TikTok': { minLength: 0.5, maxLength: 3 },
  'Explainer': { minLength: 1, maxLength: 5 }
};