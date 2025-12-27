'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NestedNavItem {
  href?: string;
  label: string;
  adminOnly?: boolean;
  investorOnly?: boolean;
  children?: NestedNavItem[];
}

interface NestedDropdownProps {
  label: string;
  items: NestedNavItem[];
  user?: { role?: string; userType?: string } | null;
  className?: string;
}

export default function NestedDropdown({ label, items, user, className }: NestedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on user permissions
  const filterItems = (items: NestedNavItem[]): NestedNavItem[] => {
    return items
      .filter((item) => {
        if (item.adminOnly && user?.role !== 'ADMIN') return false;
        if (item.investorOnly && user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined,
      }));
  };

  const filteredItems = filterItems(items);

  // Check if any child item is active
  const checkActive = (items: NestedNavItem[]): boolean => {
    return items.some((item) => {
      if (item.href) {
        if (item.href === '/') return pathname === '/';
        if (pathname?.startsWith(item.href)) return true;
      }
      if (item.children) {
        return checkActive(item.children);
      }
      return false;
    });
  };

  const isActive = checkActive(filteredItems);

  if (filteredItems.length === 0) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
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
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-down"
          onMouseLeave={() => {
            setIsOpen(false);
            setOpenSubmenu(null);
          }}
        >
          {filteredItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const itemIsActive = item.href ? pathname?.startsWith(item.href) : false;
            const submenuIsOpen = openSubmenu === `submenu-${index}`;

            return (
              <div key={index} className="relative">
                {hasChildren ? (
                  <>
                    <div
                      className={cn(
                        'flex items-center justify-between px-4 py-2 text-sm transition-colors cursor-pointer',
                        itemIsActive || submenuIsOpen
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onMouseEnter={() => setOpenSubmenu(`submenu-${index}`)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {submenuIsOpen && (
                      <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        {item.children?.map((child, childIndex) => {
                          const childIsActive = child.href ? pathname?.startsWith(child.href) : false;
                          return child.href ? (
                            <Link
                              key={childIndex}
                              href={child.href}
                              onClick={() => {
                                setIsOpen(false);
                                setOpenSubmenu(null);
                              }}
                              className={cn(
                                'block px-4 py-2 text-sm transition-colors',
                                childIsActive
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              )}
                            >
                              {child.label}
                            </Link>
                          ) : (
                            <div
                              key={childIndex}
                              className="px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200"
                            >
                              {child.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : item.href ? (
                  <Link
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
                ) : (
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

