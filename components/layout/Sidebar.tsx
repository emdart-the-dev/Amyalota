'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg hover:scale-105 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-black dark:text-white" />
        ) : (
          <Menu className="w-5 h-5 text-black dark:text-white" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 z-40 transform transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto md:shadow-none
      `}>
        <div className="flex flex-col h-full">
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="mb-8 mt-8 md:mt-0">
              <h2 className="text-lg font-semibold text-black dark:text-white px-4">
                Navigation
              </h2>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02]
                      ${isActive 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                        : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}