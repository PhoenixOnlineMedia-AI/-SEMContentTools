import { type FC, useEffect, useState, useRef } from 'react';
import { useContentStore } from '../lib/store';
import { analyzeSEOMetrics, calculateSEOScore, type SEOMetrics } from '../lib/seoUtils';
import { Loader } from 'lucide-react';

interface AnalyzedMetrics extends SEOMetrics {
  score: number;
}

export const SEOAnalyzer: FC = () => {
  return (
    <SEOAnalyzerContent />
  );
};

const SEOAnalyzerContent: FC = () => {
  const { 
    content, 
    selectedKeywords = [],
    title = '', 
    metaDescription = '', 
    isLoading: storeLoading = false,
    currentId
  } = useContentStore();

  const [metrics, setMetrics] = useState<AnalyzedMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const previousContentRef = useRef<string>('');
  const previousKeywordsRef = useRef<string[]>([]);

  // Effect to handle content and keyword updates
  useEffect(() => {
    const contentChanged = content !== previousContentRef.current;
    const keywordsChanged = JSON.stringify(selectedKeywords) !== JSON.stringify(previousKeywordsRef.current);
    
    console.log('SEOAnalyzer dependencies check:', {
      contentChanged,
      keywordsChanged,
      currentContent: {
        length: content?.length,
        preview: content?.substring(0, 100)
      },
      previousContent: {
        length: previousContentRef.current?.length,
        preview: previousContentRef.current?.substring(0, 100)
      },
      currentKeywords: selectedKeywords,
      previousKeywords: previousKeywordsRef.current,
      currentId
    });

    // Only analyze if something has changed
    if (!contentChanged && !keywordsChanged) {
      console.log('No changes detected, skipping analysis');
      return;
    }

    // Update refs
    previousContentRef.current = content;
    previousKeywordsRef.current = selectedKeywords;

    if (!content || !selectedKeywords.length) {
      console.log('Cannot analyze - missing required data:', {
        hasContent: !!content,
        contentLength: content?.length,
        selectedKeywordsCount: selectedKeywords?.length,
        content: content?.substring(0, 100)
      });
      setMetrics(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Starting SEO analysis:', {
        contentLength: content.length,
        contentPreview: content.substring(0, 100),
        selectedKeywords,
        title
      });
      
      const seoMetrics = analyzeSEOMetrics(content, selectedKeywords);
      const score = calculateSEOScore(seoMetrics).total;
      
      const result: AnalyzedMetrics = {
        ...seoMetrics,
        score
      };

      console.log('Analysis complete:', {
        metrics: result,
        score,
        contentAnalyzed: content.substring(0, 100)
      });
      
      setMetrics(result);
    } catch (error) {
      console.error('Error analyzing content:', error);
      setMetrics(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, selectedKeywords, title, metaDescription, currentId]);

  if (storeLoading || isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin">
            <Loader className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {storeLoading ? 'Loading Content' : 'Analyzing Content'}
            </h3>
            <p className="text-gray-600">Please wait...</p>
            {content && (
              <div className="mt-2 text-sm text-gray-500">
                <p>Content Length: {content.length} characters</p>
                <p>Keywords: {selectedKeywords.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!content || !selectedKeywords.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Content to Analyze</h3>
          <p className="text-gray-600">
            {!content ? 'Waiting for content to be loaded...' : 'Please select at least one keyword to analyze.'}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Content Status: {content ? `${content.length} characters` : 'Not loaded'}</p>
            <p>Keywords Selected: {selectedKeywords.length}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Analysis Not Available</h3>
          <p className="text-gray-600">
            Unable to analyze content. Please try refreshing the page.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Content Length: {content.length} characters</p>
            <p>Keywords: {selectedKeywords.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">SEO Analysis</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{Math.round(metrics.score)}/100</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold">Score Breakdown</h4>
          <div className="grid gap-3">
            {Object.entries(calculateSEOScore(metrics).breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <div className="w-32 text-sm text-gray-600 capitalize">{key}</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        value >= 15 ? 'bg-green-500' :
                        value >= 10 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(value / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-medium">{value}/20</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Content Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Word Count</span>
                <span className={`font-medium ${
                  metrics.wordCount >= 300 ? 'text-green-500' :
                  metrics.wordCount >= 200 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {metrics.wordCount} words
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reading Time</span>
                <span className="font-medium">{metrics.readingTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Readability</span>
                <span className={`font-medium ${
                  metrics.fleschScore >= 60 ? 'text-green-500' :
                  metrics.fleschScore >= 40 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {Math.round(metrics.fleschScore)}/100
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Technical SEO</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Title Length</span>
                <span className={`font-medium ${
                  metrics.titleLength >= 50 && metrics.titleLength <= 60 ? 'text-green-500' :
                  metrics.titleLength >= 40 && metrics.titleLength <= 70 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {metrics.titleLength}/60
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Meta Description</span>
                <span className={`font-medium ${
                  metrics.metaDescriptionLength >= 150 && metrics.metaDescriptionLength <= 160 ? 'text-green-500' :
                  metrics.metaDescriptionLength >= 120 && metrics.metaDescriptionLength <= 180 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {metrics.metaDescriptionLength}/160
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Links</span>
                <span className="font-medium">
                  {metrics.linkStats.internal} internal, {metrics.linkStats.external} external
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Heading Structure</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(metrics.headingDistribution).map(([tag, count]) => (
              <div key={tag} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-600 uppercase">{tag}</div>
                <div className={`text-xl font-bold ${
                  tag === 'h1' ? (count === 1 ? 'text-green-500' : 'text-red-500') :
                  count > 0 ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Keyword Analysis</h4>
          <div className="space-y-4">
            {metrics.keywordStats.map((stat) => (
              <div key={stat.keyword} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{stat.keyword}</span>
                  <span className="text-sm text-gray-600">
                    {stat.count} occurrences
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Density</span>
                    <span className={`text-sm font-medium ${
                      stat.density >= 0.5 && stat.density <= 2.5 ? 'text-green-500' :
                      stat.density > 2.5 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {stat.density.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        stat.density >= 0.5 && stat.density <= 2.5 ? 'bg-green-500' :
                        stat.density > 2.5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (stat.density / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Content Structure</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Paragraphs</div>
              <div className="flex justify-between items-center">
                <span>Total</span>
                <span className="font-medium">{metrics.paragraphStats.total}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Long ({'>'}300 chars)</span>
                <span className={`font-medium ${
                  metrics.paragraphStats.longParagraphs === 0 ? 'text-green-500' :
                  metrics.paragraphStats.longParagraphs <= 2 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {metrics.paragraphStats.longParagraphs}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Images</div>
              <div className="flex justify-between items-center">
                <span>Total</span>
                <span className="font-medium">{metrics.imageStats.total}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">With Alt Text</span>
                <span className={`font-medium ${
                  metrics.imageStats.withAlt === metrics.imageStats.total ? 'text-green-500' :
                  metrics.imageStats.withAlt > 0 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {metrics.imageStats.withAlt}/{metrics.imageStats.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};