import React from 'react';
import { useContentStore } from '../lib/store';
import ReactMarkdown from 'react-markdown';

export function ContentEditor() {
  const { content, setContent, title, isLoading } = useContentStore();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-semibold">Content Editor</h2>
        {title && (
          <p className="text-gray-600 mt-1">
            Title: {title}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => {
              const preview = document.getElementById('preview');
              preview?.classList.toggle('hidden');
            }}
          >
            Toggle Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="min-h-[400px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your content will appear here..."
              disabled={isLoading}
            />
          </div>
          
          <div id="preview" className="hidden lg:block min-h-[400px] p-4 border rounded-lg overflow-auto">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            Word count: {content.split(/\s+/).filter(Boolean).length}
          </div>
          <button
            onClick={() => {/* Add save functionality */}}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            disabled={isLoading || !content.trim()}
          >
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}