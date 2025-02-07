import type { ContentType } from '../../../lib/store';
import { ContentHandler } from './ContentHandler';
import { BlogPostHandler } from './BlogPostHandler';
import { ServicePageHandler } from './ServicePageHandler';
import { EmailSequenceHandler } from './EmailSequenceHandler';
import { SocialMediaHandler } from './SocialMediaHandler';
import { VideoScriptHandler } from './VideoScriptHandler';

export class HandlerFactory {
  private static handlers: Map<ContentType, ContentHandler> = new Map();

  static getHandler(contentType: ContentType, platform?: string): ContentHandler {
    // For platform-specific content types, create a new handler with the current platform
    if (contentType === 'Social Media Post') {
      return new SocialMediaHandler(platform || '');
    }
    
    if (contentType === 'Video Script' && platform) {
      return new VideoScriptHandler(platform);
    }

    // Return cached handler for non-platform content types
    if (this.handlers.has(contentType)) {
      return this.handlers.get(contentType)!;
    }

    // Create new handler based on content type
    let handler: ContentHandler;
    switch (contentType) {
      case 'Blog Post':
        handler = new BlogPostHandler();
        break;
      case 'Service Page':
        handler = new ServicePageHandler();
        break;
      case 'Email Sequence':
        handler = new EmailSequenceHandler();
        break;
      case 'Landing Page':
        handler = new BlogPostHandler(); // Uses same flow as blog post
        break;
      case 'Listicle':
        handler = new BlogPostHandler(); // Uses same flow as blog post
        break;
      case 'Resource Guide':
        handler = new BlogPostHandler(); // Uses same flow as blog post
        break;
      default:
        throw new Error(`No handler found for content type: ${contentType}`);
    }

    // Cache the handler
    this.handlers.set(contentType, handler);
    return handler;
  }

  static clearHandlers() {
    this.handlers.clear();
  }
} 