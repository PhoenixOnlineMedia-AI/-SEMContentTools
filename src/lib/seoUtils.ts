import { HTMLElement as ParsedHTMLElement } from 'node-html-parser';

export interface KeywordStat {
  keyword: string;
  count: number;
  density: number;
}

export interface SEOMetrics {
  titleLength: number;
  metaDescriptionLength: number;
  wordCount: number;
  readingTime: number;
  fleschScore: number;
  headingDistribution: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  paragraphStats: {
    total: number;
    longParagraphs: number;
  };
  imageStats: {
    total: number;
    withAlt: number;
  };
  linkStats: {
    total: number;
    internal: number;
    external: number;
  };
  keywordDensity: number;
  keywordStats: KeywordStat[];
  totalKeywordDensity: number;
}

function getTextContent(element: ParsedHTMLElement | string | Element): string {
  if (typeof element === 'string') {
    try {
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = element;
      
      // Remove script and style elements
      const scripts = tempDiv.querySelectorAll('script');
      const styles = tempDiv.querySelectorAll('style');
      scripts.forEach(el => el.remove());
      styles.forEach(el => el.remove());
      
      // Get text content and normalize whitespace
      const text = tempDiv.textContent?.replace(/\s+/g, ' ').trim() || '';
      console.log('Extracted text content:', { 
        length: text.length, 
        preview: text.substring(0, 100),
        hasContent: text.length > 0,
        originalLength: element.length
      });
      return text;
    } catch (error) {
      console.error('Error parsing HTML:', error);
      // Fallback to basic HTML stripping
      const text = element.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log('Fallback text extraction:', {
        length: text.length,
        preview: text.substring(0, 100)
      });
      return text;
    }
  }
  
  // If element is already a ParsedHTMLElement or Element
  const content = element.textContent || '';
  const text = content.replace(/\s+/g, ' ').trim();
  console.log('Element text content:', {
    length: text.length,
    preview: text.substring(0, 100)
  });
  return text;
}

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  console.log('Word count:', words.length);
  return words.length;
}

export function calculateFleschScore(text: string): number {
  const words = countWords(text);
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const syllables = countSyllables(text);
  
  if (words === 0 || sentences === 0) return 0;
  
  return Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)));
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.reduce((total, word) => {
    return total + countWordSyllables(word);
  }, 0);
}

function countWordSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function getTitle(element: Element | ParsedHTMLElement): string {
  const h1 = element.querySelector('h1');
  return h1 ? getTextContent(h1) : '';
}

function getMetaDescription(element: Element | ParsedHTMLElement): string {
  const metaDesc = element.querySelector('meta[name="description"]');
  return metaDesc ? metaDesc.getAttribute('content') || '' : '';
}

function getHeadingDistribution(root: ParsedHTMLElement | string | Element) {
  let element: Element | null = null;
  
  if (typeof root === 'string') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = root;
    element = tempDiv;
  } else if (root instanceof Element) {
    element = root;
  } else {
    // Handle ParsedHTMLElement case
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = root.toString();
    element = tempDiv;
  }
  
  if (!element) {
    return {
      h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0
    };
  }
  
  return {
    h1: element.querySelectorAll('h1').length,
    h2: element.querySelectorAll('h2').length,
    h3: element.querySelectorAll('h3').length,
    h4: element.querySelectorAll('h4').length,
    h5: element.querySelectorAll('h5').length,
    h6: element.querySelectorAll('h6').length,
  };
}

function analyzeKeywords(text: string, keywords: string[]): { 
  keywordStats: KeywordStat[];
  totalDensity: number;
} {
  const totalWords = countWords(text);
  if (totalWords === 0 || !keywords.length) {
    return { 
      keywordStats: [],
      totalDensity: 0 
    };
  }

  const textLower = text.toLowerCase();
  let totalKeywordCount = 0;
  
  const keywordStats = keywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    // Create a regex that matches word boundaries and handles special characters
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = textLower.match(regex);
    const count = matches ? matches.length : 0;
    totalKeywordCount += count;
    
    return {
      keyword,
      count,
      density: (count / totalWords) * 100
    };
  });

  return {
    keywordStats,
    totalDensity: (totalKeywordCount / totalWords) * 100
  };
}

export function analyzeSEOMetrics(content: string, keywords: string[]): SEOMetrics {
  try {
    // Validate inputs
    console.log('analyzeSEOMetrics called with:', {
      contentLength: content?.length,
      contentPreview: content?.substring(0, 100),
      keywords,
      hasContent: !!content,
      hasKeywords: Array.isArray(keywords) && keywords.length > 0
    });

    if (!content || typeof content !== 'string') {
      console.error('Invalid content provided to analyzeSEOMetrics:', {
        content,
        type: typeof content,
        length: content?.length
      });
      throw new Error('Content must be a non-empty string');
    }

    if (!Array.isArray(keywords)) {
      console.error('Invalid keywords provided to analyzeSEOMetrics:', {
        keywords,
        type: typeof keywords
      });
      throw new Error('Keywords must be an array');
    }

    console.log('Starting SEO analysis with:', {
      contentLength: content.length,
      contentPreview: content.substring(0, 100),
      keywordsCount: keywords.length,
      keywords
    });

    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get plain text content for word count and keyword analysis
    const textContent = getTextContent(content);
    if (!textContent) {
      console.error('No text content extracted from HTML:', {
        originalContent: content,
        tempDivContent: tempDiv.innerHTML
      });
      throw new Error('No text content could be extracted from HTML');
    }

    console.log('Text content extracted:', {
      length: textContent.length,
      preview: textContent.substring(0, 100),
      originalLength: content.length
    });

    const wordCount = countWords(textContent);
    console.log('Word count:', wordCount);
    
    if (wordCount === 0) {
      console.error('No words found in content');
      throw new Error('No words found in content');
    }

    // Get heading distribution
    const headingDistribution = getHeadingDistribution(content);
    console.log('Heading distribution:', headingDistribution);

    // Analyze keywords
    const keywordAnalysis = analyzeKeywords(textContent, keywords);
    console.log('Keyword analysis:', keywordAnalysis);

    // Get paragraph statistics
    const paragraphs = tempDiv.querySelectorAll('p');
    const longParagraphs = Array.from(paragraphs).filter(p => getTextContent(p).length > 300).length;
    console.log('Paragraph stats:', { 
      total: paragraphs.length, 
      longParagraphs,
      firstParagraph: paragraphs[0]?.textContent?.substring(0, 100) 
    });

    // Get image statistics
    const images = tempDiv.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt')?.trim()).length;
    console.log('Image stats:', { 
      total: images.length, 
      withAlt: imagesWithAlt,
      firstImageAlt: images[0]?.getAttribute('alt') 
    });

    // Get link statistics
    const links = tempDiv.querySelectorAll('a');
    const externalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href') || '';
      return href.startsWith('http') || href.startsWith('https');
    }).length;

    // Calculate Flesch score
    const fleschScore = calculateFleschScore(textContent);
    console.log('Flesch score:', fleschScore);

    const metrics = {
      titleLength: getTitle(tempDiv).length,
      metaDescriptionLength: getMetaDescription(tempDiv).length,
      wordCount,
      readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
      fleschScore,
      headingDistribution,
      paragraphStats: {
        total: paragraphs.length,
        longParagraphs
      },
      imageStats: {
        total: images.length,
        withAlt: imagesWithAlt
      },
      linkStats: {
        total: links.length,
        internal: links.length - externalLinks,
        external: externalLinks
      },
      keywordDensity: keywordAnalysis.totalDensity,
      keywordStats: keywordAnalysis.keywordStats,
      totalKeywordDensity: keywordAnalysis.totalDensity
    };

    console.log('Final SEO metrics:', metrics);
    return metrics;
  } catch (error) {
    console.error('Error analyzing SEO metrics:', error);
    throw error;
  }
}

export function calculateSEOScore(metrics: SEOMetrics): {
  total: number;
  breakdown: {
    content: number;
    readability: number;
    keywords: number;
    structure: number;
    technical: number;
  };
} {
  // Content Score (20 points)
  const contentScore = Math.min(20, (metrics.wordCount / 800) * 20);
  
  // Readability Score (20 points)
  // Flesch score of 60-70 is ideal, normalize to 0-20
  const readabilityScore = Math.max(0, Math.min(20, ((metrics.fleschScore - 30) / 40) * 20));
  
  // Keyword Score (20 points)
  // Ideal total keyword density is 1-3%
  let keywordScore = 0;
  if (metrics.totalKeywordDensity > 0) {
    if (metrics.totalKeywordDensity <= 3) {
      // Score increases linearly up to 3% density
      keywordScore = Math.min(20, metrics.totalKeywordDensity * 6.67);
    } else {
      // Score decreases for densities above 3%
      keywordScore = Math.max(0, 20 - ((metrics.totalKeywordDensity - 3) * 4));
    }
  }
  
  // Structure Score (20 points)
  let structureScore = 0;
  // H1 check (5 points)
  if (metrics.headingDistribution.h1 === 1) structureScore += 5;
  // H2+ check (5 points)
  if (metrics.headingDistribution.h2 > 0) structureScore += 5;
  // Paragraph length check (5 points)
  if (metrics.paragraphStats.longParagraphs === 0) structureScore += 5;
  // Image alt text check (5 points)
  if (metrics.imageStats.total > 0 && metrics.imageStats.withAlt === metrics.imageStats.total) structureScore += 5;
  
  // Technical Score (20 points)
  let technicalScore = 0;
  // Title length (7 points)
  if (metrics.titleLength >= 50 && metrics.titleLength <= 60) {
    technicalScore += 7;
  } else if (metrics.titleLength >= 40 && metrics.titleLength <= 70) {
    technicalScore += 4;
  }
  // Meta description length (7 points)
  if (metrics.metaDescriptionLength >= 150 && metrics.metaDescriptionLength <= 160) {
    technicalScore += 7;
  } else if (metrics.metaDescriptionLength >= 120 && metrics.metaDescriptionLength <= 180) {
    technicalScore += 4;
  }
  // Internal links (3 points)
  if (metrics.linkStats.internal > 0) technicalScore += 3;
  // External links (3 points)
  if (metrics.linkStats.external > 0) technicalScore += 3;

  const total = Math.round(contentScore + readabilityScore + keywordScore + structureScore + technicalScore);

  return {
    total,
    breakdown: {
      content: Math.round(contentScore),
      readability: Math.round(readabilityScore),
      keywords: Math.round(keywordScore),
      structure: Math.round(structureScore),
      technical: Math.round(technicalScore)
    }
  };
}