import React, { useEffect } from 'react';

interface EditorNotificationProps {
  message: string;
  isVisible: boolean;
}

export function EditorNotification({ message, isVisible }: EditorNotificationProps) {
  useEffect(() => {
    console.log('EditorNotification component received props:', { message, isVisible });
  }, [isVisible, message]);

  // Early return if not visible or no message
  if (!isVisible || !message) {
    console.log('EditorNotification not showing because:', { isVisible, hasMessage: !!message });
    return null;
  }
  
  console.log('Rendering editor notification with message:', message);
  
  return (
    <div 
      className="fixed top-16 left-0 right-0 bg-blue-600 text-white px-6 py-4 shadow-lg flex items-center justify-center z-[9999] border-b-2 border-blue-700"
      style={{ pointerEvents: 'none' }}
    >
      <div className="mr-3 animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
      <span className="font-medium text-lg">{message}</span>
    </div>
  );
} 