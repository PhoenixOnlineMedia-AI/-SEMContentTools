import React, { useEffect, useRef } from 'react';
import {
  Wand2, Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Link, Heading1, Heading2,
  Heading3, Quote, Undo, Redo, Eraser, Type
} from 'lucide-react';
import { InsertMenu } from './InsertMenu';
import { EnhanceMenu } from './EnhanceMenu';

interface EditorToolbarProps {
  onEnhance: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

export function EditorToolbar({ onEnhance, editorRef }: EditorToolbarProps) {
  const lastSelectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (lastSelectionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(lastSelectionRef.current);
          editorRef.current.focus();
        } catch (e) {
          console.debug('Could not restore selection', e);
        }
      }
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    
    // Save current selection
    saveSelection();
    
    // Focus and execute command
    editorRef.current.focus();
    document.execCommand(command, false, value);
    
    // Restore selection and keep focus with a longer delay to ensure the command has finished
    setTimeout(() => {
      if (lastSelectionRef.current && editorRef.current) {
        try {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(lastSelectionRef.current);
            editorRef.current.focus();
            
            // Ensure the cursor is visible by scrolling it into view if needed
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.current.getBoundingClientRect();
            
            if (rect.top < editorRect.top || rect.bottom > editorRect.bottom) {
              range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        } catch (e) {
          console.debug('Could not restore selection', e);
        }
      }
    }, 50); // Increased delay to ensure command completion
  };

  const handleHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const handleLink = () => {
    saveSelection();
    const url = prompt('Enter URL:', 'http://');
    if (url) {
      restoreSelection();
      execCommand('createLink', url);
    }
  };

  const handleFontSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontSize', event.target.value);
  };

  const handleFontFamily = (event: React.ChangeEvent<HTMLSelectElement>) => {
    execCommand('fontName', event.target.value);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    value, 
    title 
  }: { 
    icon: React.ElementType; 
    command: string; 
    value?: string; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command, value)}
      className="p-1.5 hover:bg-gray-100 rounded group relative"
      title={title}
    >
      <Icon className="w-4 h-4" />
      <span className="sr-only">{title}</span>
    </button>
  );

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-2">
      {/* Document Operations */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <ToolbarButton icon={Undo} command="undo" title="Undo (⌘Z)" />
        <ToolbarButton icon={Redo} command="redo" title="Redo (⌘⇧Z)" />
      </div>

      {/* Text Style */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <select
          onChange={handleFontFamily}
          className="h-8 px-2 border border-gray-200 rounded text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select
          onChange={handleFontSize}
          className="h-8 w-20 px-2 border border-gray-200 rounded text-sm"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <ToolbarButton icon={Bold} command="bold" title="Bold (⌘B)" />
        <ToolbarButton icon={Italic} command="italic" title="Italic (⌘I)" />
        <ToolbarButton icon={Underline} command="underline" title="Underline (⌘U)" />
        <ToolbarButton icon={Strikethrough} command="strikeThrough" title="Strikethrough" />
      </div>

      {/* Headings */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          type="button"
          onClick={() => handleHeading(1)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleHeading(2)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleHeading(3)}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Paragraph Formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        <ToolbarButton icon={AlignJustify} command="justifyFull" title="Justify" />
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={Quote} command="formatBlock" value="blockquote" title="Block Quote" />
      </div>

      {/* Insert */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 hover:bg-gray-100 rounded"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <InsertMenu editorRef={editorRef} />
      </div>

      {/* Clear Formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <ToolbarButton icon={Eraser} command="removeFormat" title="Clear Formatting" />
      </div>

      {/* AI Tools */}
      <div className="flex items-center space-x-2">
        <EnhanceMenu editorRef={editorRef} />
      </div>
    </div>
  );
}