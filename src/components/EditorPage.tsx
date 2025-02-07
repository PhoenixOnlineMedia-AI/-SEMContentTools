import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '../lib/store';
import { Eye, Code, Save, ArrowLeft, Download, FileText, FileCode, File, FileBox } from 'lucide-react';
import { SEOAnalyzer } from './SEOAnalyzer';
import { EditorToolbar } from './EditorToolbar';
import { supabase } from '../lib/supabase';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { turndown } from '../lib/turndown';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [exportTitle, setExportTitle] = useState<string>('');
  const { 
    content, 
    setContent,
    title, 
    setTitle,
    setContentType,
    setTopic,
    setOutline,
    setMetaDescription,
    setKeywords,
    setSelectedKeywords,
    saveContent,
    setCurrentId,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useContentStore();
  const [showHtml, setShowHtml] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSelectionRef = useRef<Range | null>(null);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    if (id) {
      setCurrentId(id);
      loadContent(id);
    } else {
      setCurrentId(null);
    }
  }, [id, setCurrentId]);

  // Initialize editor and set up event listeners
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    console.log('Initializing editor with content:', content);

    // Only set initial content if editor is empty
    if (content && editor.innerHTML === '') {
      console.log('Setting initial content');
      editor.innerHTML = content;
      setEditorContent(content);
    }

    if (!isInitialized) {
      // Save selection before any changes
      const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Only save if the selection is within the editor
          if (editor.contains(range.commonAncestorContainer)) {
            lastSelectionRef.current = range.cloneRange();
          }
        }
      };

      // Handle keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      };

      // Handle selection changes
      const handleSelectionChange = () => {
        saveSelection();
      };

      // Handle content changes
      const handleInput = () => {
        if (!editorRef.current) return;
        const newContent = editorRef.current.innerHTML;
        console.log('Editor content updated:', {
          length: newContent.length,
          preview: newContent.substring(0, 100)
        });
        setContent(newContent);
      };

      // Add event listeners
      editor.addEventListener('input', handleInput);
      editor.addEventListener('keydown', handleKeyDown);
      document.addEventListener('selectionchange', handleSelectionChange);

      setIsInitialized(true);

      // Cleanup
      return () => {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [content, isInitialized, setContent]);

  // Handle content updates while preserving selection
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !showHtml) return;

    const selection = window.getSelection();
    if (!selection) return;

    let savedRange: Range | null = null;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Only save if the selection is within the editor
      if (editor.contains(range.commonAncestorContainer)) {
        savedRange = range.cloneRange();
      }
    }

    editor.innerHTML = content;

    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      try {
        // Try to restore the exact range
        selection.removeAllRanges();
        selection.addRange(savedRange);
        
        // Ensure the cursor is visible
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        
        if (rect.top < editorRect.top || rect.bottom > editorRect.bottom) {
          range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (e) {
        // If exact restoration fails, move to end
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [content, showHtml]);

  useEffect(() => {
    // Update exportTitle whenever title changes
    setExportTitle(title || '');
  }, [title]);

  const loadContent = async (contentId: string) => {
    try {
      console.log('Loading content for ID:', contentId);
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      if (data) {
        console.log('Content loaded from database:', {
          contentLength: data.content?.length,
          title: data.title,
          keywords: data.keywords,
          contentType: data.content_type,
          hasContent: !!data.content,
          hasKeywords: Array.isArray(data.keywords) && data.keywords.length > 0
        });
        
        // Set content first to prevent race conditions
        const contentToSet = data.content || '';
        setContent(contentToSet);
        
        // Update editor content immediately
        const editor = editorRef.current;
        if (editor && editor.innerHTML !== contentToSet) {
          editor.innerHTML = contentToSet;
        }
        
        // Then set other properties
        setContentType(data.content_type || '');
        setTopic(data.topic || '');
        setTitle(data.title || '');
        setOutline(data.outline || []);
        setMetaDescription(data.meta_description || '');
        setKeywords(data.keywords || []);
        setSelectedKeywords(data.keywords || []);
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Set loading state
      setIsLoading(true);

      // Get the current content from the editor to ensure we have the latest changes
      const editor = editorRef.current;
      if (editor) {
        setContent(editor.innerHTML);
      }

      // Wait for the save to complete
      await saveContent();

      // Show success message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Content saved successfully';
      document.body.appendChild(messageDiv);

      // Remove the message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 3000);

    } catch (error: any) {
      console.error('Error saving content:', error);
      // Show error message to the user
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = error.message || 'Failed to save content. Please try again.';
      document.body.appendChild(messageDiv);

      // Remove the error message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 5000);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  const handleEnhance = () => {
    // To be implemented
    console.log('Enhance clicked');
  };

  // Toggle between HTML and Preview modes
  const handleViewToggle = () => {
    if (showHtml) {
      // Switching from HTML to Preview
      setShowHtml(false);
      // Use setTimeout to ensure the editor div is rendered before setting content
      setTimeout(() => {
        const editor = editorRef.current;
        if (editor) {
          editor.innerHTML = editorContent;
          setContent(editorContent);
        }
      }, 0);
    } else {
      // Switching to HTML view
      const editor = editorRef.current;
      if (editor) {
        setEditorContent(editor.innerHTML);
        setContent(editor.innerHTML);
      }
      setShowHtml(true);
    }
  };

  // Effect to handle content updates in preview mode
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || showHtml) return;

    editor.innerHTML = content;
  }, [content, showHtml]);

  const handleExport = async (format: 'pdf' | 'html' | 'markdown' | 'doc' | 'text') => {
    const editor = editorRef.current;
    if (!editor) return;

    // Try to get title from store or extract from content
    let titleToUse = exportTitle;
    if (!titleToUse) {
      // Create a temporary element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.innerHTML;
      
      // Try to find the first h1 tag
      const firstH1 = tempDiv.querySelector('h1');
      if (firstH1) {
        titleToUse = firstH1.textContent || '';
      }
      
      // If no h1, try h2
      if (!titleToUse) {
        const firstH2 = tempDiv.querySelector('h2');
        if (firstH2) {
          titleToUse = firstH2.textContent || '';
        }
      }
    }

    if (!titleToUse?.trim()) {
      // Show error message if no title found
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Please add a title before exporting';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 3000);
      return;
    }
    
    // Create filename from title
    const fileName = titleToUse
      .trim()
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .toLowerCase();

    const content = showHtml ? editorContent : editor.innerHTML;

    switch (format) {
      case 'pdf':
        // Use html2pdf library
        const html2pdf = (await import('html2pdf.js')).default;
        
        // Create a temporary div with proper styling
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
          <div style="font-family: Arial, sans-serif;">
            <h1 style="font-size: 28px; color: #1a1a1a; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              ${titleToUse}
            </h1>
            ${content}
          </div>
        `;
        
        // Apply styles to maintain formatting
        const styles = document.createElement('style');
        styles.textContent = `
          /* Heading Styles */
          h1 { 
            font-size: 28px; 
            color: #1a1a1a;
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 700;
          }
          h2 { 
            font-size: 24px; 
            color: #1f2937;
            margin-top: 20px;
            margin-bottom: 14px;
            font-weight: 600;
          }
          h3 { 
            font-size: 20px; 
            color: #374151;
            margin-top: 18px;
            margin-bottom: 12px;
            font-weight: 600;
          }
          h4 { 
            font-size: 18px; 
            color: #4b5563;
            margin-top: 16px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          h5 { 
            font-size: 16px; 
            color: #6b7280;
            margin-top: 14px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          h6 { 
            font-size: 14px; 
            color: #9ca3af;
            margin-top: 12px;
            margin-bottom: 8px;
            font-weight: 600;
          }

          /* Content Styles */
          p { 
            margin-bottom: 1em; 
            line-height: 1.6;
            font-size: 14px;
            color: #374151;
          }
          
          /* List Styles */
          ul, ol { 
            margin: 1em 0; 
            padding-left: 2em;
          }
          li { 
            margin-bottom: 0.5em;
            line-height: 1.5;
            font-size: 14px;
            color: #374151;
          }
          
          /* Link Styles */
          a { 
            color: #2563eb; 
            text-decoration: underline;
          }
          
          /* Blockquote Styles */
          blockquote { 
            margin: 1.5em 0;
            padding: 1em 1.5em;
            border-left: 4px solid #e5e7eb;
            background: #f9fafb;
            font-style: italic;
            color: #4b5563;
          }
          
          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
            font-size: 14px;
          }
          th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 600;
            padding: 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
          }
          td {
            padding: 12px;
            border: 1px solid #e5e7eb;
            color: #374151;
          }
          
          /* Image Styles */
          img { 
            max-width: 100%; 
            height: auto; 
            margin: 1.5em 0;
            border-radius: 4px;
          }
        `;
        tempDiv.appendChild(styles);
        
        // Configure PDF options
        const opt = {
          margin: [1, 0.75, 1, 0.75], // Margins in inches [top, left, bottom, right]
          filename: `${fileName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
          },
          jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait'
          }
        };
        
        // Add wrapper for styling
        tempDiv.style.padding = '20px';
        tempDiv.style.maxWidth = '800px';
        tempDiv.style.margin = '0 auto';
        tempDiv.style.backgroundColor = '#fff';
        document.body.appendChild(tempDiv);
        
        try {
          await html2pdf().set(opt).from(tempDiv).save();
        } finally {
          document.body.removeChild(tempDiv);
        }
        break;

      case 'html':
        // Download as HTML file with proper formatting
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${titleToUse || 'Document'}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; color: #333; }
    p { margin-bottom: 1em; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${titleToUse ? `<h1>${titleToUse}</h1>` : ''}
  ${content}
</body>
</html>`;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = `${fileName}.html`;
        htmlLink.click();
        URL.revokeObjectURL(htmlUrl);
        break;

      case 'markdown':
        // Convert HTML to Markdown using turndown
        const markdown = turndown(content);
        const mdContent = titleToUse ? `# ${titleToUse}\n\n${markdown}` : markdown;
        const mdBlob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const mdUrl = URL.createObjectURL(mdBlob);
        const mdLink = document.createElement('a');
        mdLink.href = mdUrl;
        mdLink.download = `${fileName}.md`;
        mdLink.click();
        URL.revokeObjectURL(mdUrl);
        break;

      case 'doc':
        // Create a Word document using HTML content with proper formatting
        const docContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>${titleToUse || 'Document'}</title>
            <style>
              body { font-family: 'Calibri', sans-serif; }
              h1, h2, h3, h4, h5, h6 { margin-top: 1em; margin-bottom: 0.5em; }
              p { margin-bottom: 1em; line-height: 1.5; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${titleToUse ? `<h1>${titleToUse}</h1>` : ''}
            ${content}
          </body>
          </html>
        `;
        const docBlob = new Blob([docContent], { type: 'application/msword' });
        const docUrl = URL.createObjectURL(docBlob);
        const docLink = document.createElement('a');
        docLink.href = docUrl;
        docLink.download = `${fileName}.doc`;
        docLink.click();
        URL.revokeObjectURL(docUrl);
        break;

      case 'text':
        // Convert HTML to plain text
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        const plainText = titleToUse 
          ? `${titleToUse}\n${'='.repeat(titleToUse.length)}\n\n${tempElement.textContent || tempElement.innerText}`
          : tempElement.textContent || tempElement.innerText;
        const textBlob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        const textUrl = URL.createObjectURL(textBlob);
        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `${fileName}.txt`;
        textLink.click();
        URL.revokeObjectURL(textUrl);
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center px-4 pt-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/content')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold">{id ? 'Edit Content' : 'Content Editor'}</h2>
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Export as PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('html')}>
                      <FileCode className="w-4 h-4 mr-2" />
                      <span>Export as HTML</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('markdown')}>
                      <File className="w-4 h-4 mr-2" />
                      <span>Export as Markdown</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('doc')}>
                      <FileBox className="w-4 h-4 mr-2" />
                      <span>Export as Word</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('text')}>
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Export as Text</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={handleViewToggle}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  {showHtml ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                  <span>{showHtml ? 'Preview' : 'HTML'}</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
            {exportTitle && (
              <p className="text-gray-600 mt-1 px-4">
                Title: {exportTitle}
              </p>
            )}
            {error && (
              <p className="text-red-500 mt-2 text-sm px-4">
                {error}
              </p>
            )}
          </div>
          
          <EditorToolbar onEnhance={handleEnhance} editorRef={editorRef} />
          
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              {showHtml ? (
                <textarea
                  value={editorContent}
                  onChange={(e) => {
                    setEditorContent(e.target.value);
                    setContent(e.target.value);
                  }}
                  className="w-full h-[600px] p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="HTML content..."
                  disabled={isLoading}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  className="w-full h-[600px] p-4 border rounded-lg overflow-y-auto prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  spellCheck="false"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <div className="text-sm text-gray-500">
                Word count: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <SEOAnalyzer />
      </div>
    </div>
  );
}