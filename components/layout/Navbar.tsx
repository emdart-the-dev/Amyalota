'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-black dark:text-white truncate">
              Customer & Finance Manager
            </h1>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-black" />
            ) : (
              <Sun className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}