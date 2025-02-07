import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Plus, Grid, LogOut, CreditCard } from 'lucide-react';
import { auth } from '../lib/auth';
import { useContentStore } from '../lib/store';

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    setStep,
    setContentType,
    setTopic,
    setTitle,
    setKeywords,
    setLSIKeywords,
    setSelectedKeywords,
    setOutline,
    setContent,
    setMetaDescription,
    setCurrentId,
    setPlatform
  } = useContentStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateContent = () => {
    // Reset all content-related state
    setStep('type');
    setContentType('');
    setPlatform('');
    setTopic('');
    setTitle('');
    setKeywords([]);
    setLSIKeywords([]);
    setSelectedKeywords([]);
    setOutline([]);
    setContent('');
    setMetaDescription('');
    setCurrentId(null);
    
    // Navigate to create content page
    navigate('/');
  };

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MenuIcon className="w-6 h-6 text-gray-600" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 animate-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          style={{
            animation: 'menuEnter 0.2s ease-out forwards',
            transformOrigin: 'top right',
          }}
        >
          <button
            onClick={() => handleItemClick(handleCreateContent)}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            role="menuitem"
          >
            <Plus className="w-4 h-4 mr-3" />
            Create Content
          </button>

          <button
            onClick={() => handleItemClick(() => navigate('/content'))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            role="menuitem"
          >
            <Grid className="w-4 h-4 mr-3" />
            View Content
          </button>

          <button
            onClick={() => handleItemClick(() => navigate('/pricing'))}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            role="menuitem"
          >
            <CreditCard className="w-4 h-4 mr-3" />
            Pricing & Plans
          </button>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={() => handleItemClick(handleSignOut)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            role="menuitem"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      )}

      <style>{`
        @keyframes menuEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 640px) {
          .absolute {
            position: fixed;
            top: 4rem;
            right: 1rem;
            width: calc(100% - 2rem);
          }
        }
      `}</style>
    </div>
  );
}