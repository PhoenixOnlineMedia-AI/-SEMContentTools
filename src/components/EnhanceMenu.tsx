import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Wand2,
  Pencil,
  BookOpen,
  RefreshCw,
  MessageSquare,
  Plus,
  Minimize2,
  Briefcase,
  Coffee
} from 'lucide-react';

interface EnhanceMenuProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onEnhance?: () => void;
  showNotification?: (message: string) => void;
  hideNotification?: () => void;
}

export function EnhanceMenu({ editorRef, onEnhance, showNotification, hideNotification }: EnhanceMenuProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const getEnhanceInstructions = (type: string) => {
    const instructions = {
      'improve-writing': `Enhance the text with improved grammar, spelling, and clarity while maintaining the original meaning.

Requirements:
- Fix any grammar or spelling errors
- Improve sentence structure and flow
- Maintain the original meaning and key points
- Keep the same tone and style
- Return only the enhanced text with no additional formatting`,

      'enhance-readability': `Simplify complex sentences for easier understanding while maintaining key information.

Requirements:
- Break down complex sentences into simpler ones
- Use clearer language and explanations
- Maintain all key information and meaning
- Aim for a reading level suitable for general audience
- Return only the enhanced text with no additional formatting`,

      'rephrase-content': `Rephrase the content to improve clarity and originality while keeping the same meaning.

Requirements:
- Rephrase sentences to be more clear and engaging
- Maintain the exact same meaning and key points
- Keep the same tone and level of formality
- Avoid clichés and overused phrases
- Return only the enhanced text with no additional formatting`,

      'use-persuasive': `Add engaging copywriting words and phrases to boost conversions while maintaining authenticity.

Requirements:
- Add persuasive language and power words
- Enhance emotional appeal and engagement
- Maintain credibility and authenticity
- Keep the core message intact
- Return only the enhanced text with no additional formatting`,

      'expand-content': `Add more details or examples to flesh out ideas while maintaining flow.

Requirements:
- Add relevant details and examples
- Expand on key points with supporting information
- Maintain the original flow and structure
- Keep the additions relevant and valuable
- Return only the enhanced text with no additional formatting`,

      'make-concise': `Reduce unnecessary words and focus on key points while maintaining meaning.

Requirements:
- Remove redundant or unnecessary words
- Maintain all key information and meaning
- Make each sentence clear and direct
- Keep the same tone and style
- Return only the enhanced text with no additional formatting`,

      'make-professional': `Use formal language suitable for business or academic contexts while maintaining clarity.

Requirements:
- Use professional and formal language
- Maintain appropriate business/academic tone
- Keep content clear and precise
- Remove casual expressions
- Return only the enhanced text with no additional formatting`,

      'make-casual': `Use informal language suitable for social media or blog posts while maintaining quality.

Requirements:
- Use conversational and approachable language
- Add personality and relatability
- Maintain content quality and accuracy
- Keep key points clear and engaging
- Return only the enhanced text with no additional formatting`
    };
    return instructions[type as keyof typeof instructions] || '';
  };

  const handleEnhance = async (type: string) => {
    if (!editorRef.current || isEnhancing) return;

    // Get the current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Please select some text to enhance';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 3000);
      return;
    }

    // Get the selected range
    const range = selection.getRangeAt(0);
    
    // Check if the selection is within the editor
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Selection must be within the editor';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 3000);
      return;
    }
    
    // Create a temporary element to get the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(range.cloneContents());
    const selectedContent = tempDiv.innerHTML;

    // If no content is selected, show message and return
    if (!selectedContent.trim()) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Please select some text to enhance';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 3000);
      return;
    }

    // Save the selection for later use
    const savedRange = range.cloneRange();

    setIsEnhancing(true);
    
    // Show notification if available
    if (showNotification) {
      showNotification(`Enhancing text with ${type}...`);
    }
    
    try {
      console.log('Enhancing selected content:', selectedContent);
      
      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: {
          type: type,
          content: selectedContent
        }
      });

      if (error) throw error;
      if (!data?.content) throw new Error('No enhanced content received');

      // Restore the selection
      selection.removeAllRanges();
      selection.addRange(savedRange);

      // Replace the selected content with the enhanced version
      savedRange.deleteContents();
      const fragment = savedRange.createContextualFragment(data.content);
      savedRange.insertNode(fragment);
      savedRange.collapse(false);

      // Call onEnhance callback if provided
      onEnhance?.();

      // Show success message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Successfully enhanced content';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 3000);
      
      // Hide notification if available
      if (hideNotification) {
        setTimeout(() => {
          hideNotification();
        }, 1000);
      }

    } catch (error) {
      console.error('Error enhancing content:', error);
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = error instanceof Error ? error.message : 'Failed to enhance content. Please try again.';
      document.body.appendChild(messageDiv);
      setTimeout(() => document.body.removeChild(messageDiv), 5000);
      
      // Hide notification if available
      if (hideNotification) {
        hideNotification();
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
          disabled={isEnhancing}
        >
          <Wand2 className="w-4 h-4" />
          <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => handleEnhance('improve-writing')}>
          <Pencil className="h-4 w-4 mr-2" />
          <span>Improve Writing</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('enhance-readability')}>
          <BookOpen className="h-4 w-4 mr-2" />
          <span>Enhance Readability</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('rephrase-content')}>
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Rephrase Content</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('use-persuasive')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Use Persuasive Language</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('expand-content')}>
          <Plus className="h-4 w-4 mr-2" />
          <span>Expand Content</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('make-concise')}>
          <Minimize2 className="h-4 w-4 mr-2" />
          <span>Make Concise</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('make-professional')}>
          <Briefcase className="h-4 w-4 mr-2" />
          <span>Make Professional</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEnhance('make-casual')}>
          <Coffee className="h-4 w-4 mr-2" />
          <span>Make Casual</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 