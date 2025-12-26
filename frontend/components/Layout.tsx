'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Button from './ui/Button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/investments', label: 'Investments' },
    { href: '/auctions', label: 'Auctions' },
    { href: '/guarantees', label: 'Guarantees' },
    { href: '/trust', label: 'Trust Score' },
    { href: '/governance', label: 'Governance' },
    { href: '/staking', label: 'Staking' },
    { href: '/rewards', label: 'Rewards' },
    { href: '/analytics', label: 'Analytics' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-primary-700 transition-colors">
                  D
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Digital Trust
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.location.href = '/auth/logout';
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 animate-slide-down">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="text-lg font-bold text-gray-900">Digital Trust Marketplace</span>
              </div>
              <p className="text-sm text-gray-600 max-w-md">
                Web3-powered platform connecting investors and fundraisers with trust, transparency, and security.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/auctions" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Auctions
                  </Link>
                </li>
                <li>
                  <Link href="/governance" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Governance
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/trust" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Trust Score
                  </Link>
                </li>
                <Link href="/staking" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Staking
                </Link>
                <li>
                  <Link href="/rewards" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Rewards
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Digital Trust Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
