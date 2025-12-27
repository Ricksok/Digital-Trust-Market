'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DropdownItem {
  href: string;
  label: string;
  adminOnly?: boolean;
  investorOnly?: boolean;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  user?: { role?: string; userType?: string } | null;
  className?: string;
}

export default function Dropdown({ label, items, user, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on user permissions
  const filteredItems = items.filter((item) => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    if (item.investorOnly && user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) return false;
    return true;
  });

  // Check if any child item is active
  const isActive = filteredItems.some((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname?.startsWith(item.href);
  });

  if (filteredItems.length === 0) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1',
          isActive || isOpen
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          className
        )}
      >
        {label}
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slide-down">
          {filteredItems.map((item) => {
            const itemIsActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-4 py-2 text-sm transition-colors',
                  itemIsActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


