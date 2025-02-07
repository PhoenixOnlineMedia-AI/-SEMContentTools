import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  HelpCircle,
  BarChart2,
  Link2,
  Quote,
  Plus,
  Megaphone,
  Lightbulb,
  FileText,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';

interface InsertMenuProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInsert?: () => void;
}

export function InsertMenu({ editorRef, onInsert }: InsertMenuProps) {
  const [isInserting, setIsInserting] = useState(false);

  const getTypeInstructions = (type: string) => {
    const instructions = {
      'table': `Create an HTML table with proper headers and rows based on the content. Format it with clean borders and padding.`,
      'faq': `Generate a FAQ section following this EXACT HTML structure with no deviations or additional styling:

<div class="faq-section">
  <h2>Frequently Asked Questions About [Topic]</h2>
  <div class="faq-items">
    <div class="faq-item">
      <h3>[Question text here?]</h3>
      <p>[Answer text here]</p>
    </div>
  </div>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The section title MUST be an <h2> tag
- Each question MUST be an <h3> tag (no classes needed)
- Each answer MUST be a <p> tag (no classes needed)
- Generate 5-7 questions that begin with What, How, Why, When, Where, or Can
- Each answer should be 2-3 sentences of helpful, informative content
- Do not add any CSS, styling, or additional HTML
- Do not include any product recommendations or "Buy" links
- Do not include any line breaks or <br> tags at the end`,
      'statistics': `Create a statistics section following this EXACT HTML structure with no deviations or additional styling:

<div class="statistics-section">
  <h2>Key Statistics About [Topic]</h2>
  <div class="stat-grid">
    <div class="stat-item">
      <h3>[Statistic]% [Concise Context/Impact]</h3>
      <p>[One or two sentences explaining the significance and implications]</p>
    </div>
  </div>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The section title MUST be an <h2> tag and include the topic
- Each statistic MUST be an <h3> tag combining the number and context (e.g., "75% Energy Savings with LED Bulbs")
- Each description MUST be a <p> tag with 1-2 sentences of context
- Generate 4-6 impactful statistics with clear context
- Format numbers clearly (use % for percentages, appropriate units for measurements)
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'links': `Create a related links section following this EXACT HTML structure with no deviations or additional styling:

<div class="related-links">
  <h2>[Topic/Context] Related Links</h2>
  <div class="link-item">
    <p>[Text excerpt or context being referenced]</p>
    <p>[Source Name]:</p>
    <a href="[URL]"><p>[URL]</p></a>
  </div>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The section title MUST be an <h2> tag that includes the topic/context
- Each link item must have:
  - A <p> tag with the relevant text being referenced
  - A <p> tag with the source name
  - An <a> tag with href and a nested <p> for the URL
- Generate 3-5 relevant external links that directly relate to the content
- Links must be real, accessible URLs
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'quote': `Create a quote following this EXACT HTML structure with no deviations or additional styling:

<blockquote>
  "[Quote text here]"
  <cite><a href="[Source URL]">[Source Name]</a> ([Year])</cite>
</blockquote>

Requirements:
- Use EXACTLY the HTML structure shown above
- Quote must be wrapped in a <blockquote> tag
- Quote text must be in quotation marks
- Quote text must be concise (maximum 2-3 sentences, no more than 200 characters)
- Quote should capture a key insight or important point
- Citation must use <cite> tag with nested <a> tag for the source
- Include the year in parentheses
- Use a real, accessible URL for the source
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'cta': `Create a call-to-action section following this EXACT HTML structure with no deviations or additional styling:

<div class="cta-section">
  <h3>[Action-oriented heading related to context]</h3>
  <p>[One or two sentences compelling the reader to take action]</p>
  <button>[Clear call-to-action text]</button>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The heading MUST be an <h3> tag
- The description MUST be a <p> tag
- The button MUST be a <button> tag
- CTA should directly relate to the selected text or overall content
- Heading should be action-oriented and compelling (4-8 words)
- Description should be concise (1-2 sentences max)
- Button text should be clear and actionable (2-5 words)
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'pro-tip': `Create EXACTLY ONE pro tip section following this EXACT HTML structure with no deviations or additional styling:

<div class="pro-tip">
  <h3>Pro Tip</h3>
  <p>As mentioned in [referenced section/content], [specific tip related to the context with actionable advice]. [One additional sentence with supporting details or benefits].</p>
</div>

Requirements:
- Generate EXACTLY ONE pro tip only
- Use EXACTLY the HTML structure shown above
- The heading MUST be an <h3> tag with text "Pro Tip"
- The tip MUST be a <p> tag
- Content must reference the selected text or overall content context
- Tip should be specific, actionable, and directly related to the context
- Keep the tip concise (2-3 sentences max)
- Include a reference to the source content/section
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end
- DO NOT generate multiple pro tips - only one is needed`,
      'description': `Create a description box following this EXACT HTML structure with no deviations or additional styling:

<div class="description-box">
  <h3>Overview of [Topic/Subject]</h3>
  <p id="summary">[Summary of the content that is easy to understand]</p>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The div MUST have class="description-box"
- The heading MUST be an <h3> tag starting with "Overview of" followed by the relevant topic/subject
- The paragraph MUST have id="summary"
- Summary should be concise (2-3 sentences max)
- Make the summary easy to understand
- Reference the selected text or overall content
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'warning': `Create a warning section following this EXACT HTML structure with no deviations or additional styling:

<div class="content-warnings">
  <h3>Important Considerations Related to [Topic/Subject]</h3>
  <ul>
    <li>[First key warning or consideration]</li>
    <li>[Second key warning or consideration]</li>
    <li>[Third key warning or consideration]</li>
  </ul>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The div MUST have class="content-warnings"
- The heading MUST be an <h3> tag with "Important Considerations Related to" followed by the relevant topic
- Include 2-4 concise, relevant warnings as list items
- Each warning should be clear and actionable
- Reference the selected text or overall content context
- Keep each warning to one sentence
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
      'key-takeaways': `Create a key takeaways section following this EXACT HTML structure with no deviations or additional styling:

<div class="key-takeaways">
  <h3>Key Takeaways</h3>
  <ol>
    <li>[First key point from the content]</li>
    <li>[Second key point from the content]</li>
    <li>[Third key point from the content]</li>
  </ol>
</div>

Requirements:
- Use EXACTLY the HTML structure shown above
- The div MUST have class="key-takeaways"
- The heading MUST be an <h3> tag with text "Key Takeaways"
- Use an ordered list (ol) with 3-5 list items
- Each takeaway should be clear and concise (one sentence)
- Reference the selected text or overall content
- List the most important points in order of significance
- Do not add any CSS, styling, or additional HTML
- Do not include any line breaks or <br> tags at the end`,
    };
    return instructions[type as keyof typeof instructions] || '';
  };

  const handleInsert = async (type: string) => {
    if (!editorRef.current || isInserting) return;

    // Get the current selection
    const selection = window.getSelection();
    const selectedContent = selection?.toString().trim() || '';

    // Get the full content from the editor
    const fullContent = editorRef.current.innerHTML;
    
    // Extract text content without HTML tags for better context
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullContent;
    const fullTextContent = tempDiv.textContent || tempDiv.innerText;

    // Use selected content if available, otherwise use full content
    const contextContent = selectedContent || fullTextContent;

    // Get the title from the content (assuming first line or h1)
    const title = fullTextContent.split('\n')[0] || '';

    console.log('Sending insert request:', {
      type,
      contextLength: contextContent.length,
      hasSelection: !!selectedContent,
      model: 'sonar'
    });

    setIsInserting(true);
    try {
      const { data, error } = await supabase.functions.invoke('insert-content', {
        body: {
          type: type.trim(),
          content: contextContent,
          model: 'sonar',
          instructions: getTypeInstructions(type),
          title: title
        }
      });

      if (error) throw error;

      if (data?.content) {
        // Parse and clean the returned HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, 'text/html');
        const cleanContent = doc.body.innerHTML;

        // If text is selected, insert after the selection
        if (selectedContent && selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          // Create a new range at the end of the selection
          const newRange = range.cloneRange();
          newRange.collapse(false);
          
          // Insert a space and the new content
          const fragment = newRange.createContextualFragment(' ' + cleanContent);
          newRange.insertNode(fragment);
          newRange.collapse(false);
          
          // Update the selection to the end of the inserted content
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // If no text is selected, insert at cursor position or end
          const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
          if (range) {
            const fragment = range.createContextualFragment(cleanContent);
            range.insertNode(fragment);
            range.collapse(false);
          } else {
            // If no range, append to the end
            const fragment = document.createRange().createContextualFragment(cleanContent);
            editorRef.current.appendChild(fragment);
          }
        }

        // Call onInsert callback if provided
        onInsert?.();

        // Show success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        messageDiv.textContent = `Successfully inserted ${type} content`;
        document.body.appendChild(messageDiv);

        // Remove the message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(messageDiv);
        }, 3000);
      }
    } catch (error) {
      console.error('Error inserting content:', error);
      
      // Show error message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = error instanceof Error ? error.message : 'Failed to insert content. Please try again.';
      document.body.appendChild(messageDiv);

      // Remove the error message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 5000);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          disabled={isInserting}
        >
          <Plus className="w-4 h-4" />
          <span>{isInserting ? 'Inserting...' : 'Insert'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleInsert('table')}>
          <Table className="h-4 w-4 mr-2" />
          <span>Insert Table</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('faq')}>
          <HelpCircle className="h-4 w-4 mr-2" />
          <span>Insert FAQs</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('statistics')}>
          <BarChart2 className="h-4 w-4 mr-2" />
          <span>Insert Statistics</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('links')}>
          <Link2 className="h-4 w-4 mr-2" />
          <span>Insert Related Links</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('quote')}>
          <Quote className="h-4 w-4 mr-2" />
          <span>Insert Quote</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('cta')}>
          <Megaphone className="h-4 w-4 mr-2" />
          <span>Insert Call to Action</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('pro-tip')}>
          <Lightbulb className="h-4 w-4 mr-2" />
          <span>Insert Pro Tip</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('description')}>
          <FileText className="h-4 w-4 mr-2" />
          <span>Insert Description Box</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('warning')}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Insert Warning/Notice</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsert('key-takeaways')}>
          <ListChecks className="h-4 w-4 mr-2" />
          <span>Insert Key Takeaways</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 