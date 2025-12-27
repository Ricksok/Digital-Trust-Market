'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import NestedDropdown from './ui/NestedDropdown';
import UserMenu from './ui/UserMenu';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useCart } from '@/lib/queries';
import { Cart } from '@/lib/api/cart';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { data: cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  
  const cartItemCount = (cart as Cart)?.itemCount || 0;

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Navigation structure with dropdowns
  interface NavItem {
    href: string;
    label: string;
    adminOnly?: boolean;
    investorOnly?: boolean;
  }

  interface NestedNavItem {
    href?: string;
    label: string;
    adminOnly?: boolean;
    investorOnly?: boolean;
    children?: NestedNavItem[];
  }

  const marketplaceItems: NavItem[] = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/commodities', label: 'Commodities' },
    { href: '/services', label: 'Services' },
  ];

  // Securities Exchange with nested structure
  // Two-sided marketplace: Projects (products) can be purchased with Equity or Debt (secured by Guarantees)
  const securitiesExchangeItems: NestedNavItem[] = [
    { href: '/securities/projects', label: 'Projects' }, // Products for sale
    {
      label: 'Equity', // Consideration/Payment Method
      children: [
        { href: '/securities/equity/ordinary-shares', label: 'Ordinary Shares' },
        { href: '/securities/equity/preference-shares', label: 'Preference Shares' },
      ],
    },
    {
      label: 'Debt', // Consideration/Payment Method (Secured by Guarantees)
      children: [
        { href: '/securities/debt/bonds', label: 'Bonds' },
        { href: '/securities/debt/loans', label: 'Loans' },
      ],
    },
    { href: '/securities/guarantees', label: 'Guarantees' }, // Security for Debt
  ];

  const auctionsItems: NavItem[] = [
    { href: '/auctions', label: 'Auctions' },
    { href: '/staking', label: 'Staking' },
    { href: '/rewards', label: 'Rewards' },
  ];

  const analyticsItems: NavItem[] = [
    { href: '/analytics', label: 'Analytics' },
    { href: '/trust', label: 'Trust Score' },
    { href: '/learning', label: 'Learning Exchange' },
    { href: '/regulatory-reporting', label: 'Regulatory Reports', adminOnly: true },
    { href: '/investor-reporting', label: 'Investor Reports', investorOnly: true },
  ];

  const vendorItems: NavItem[] = [
    { href: '/vendor-central', label: 'Vendor Dashboard' },
  ];

  const topLevelNavItems = [
    { href: '/', label: 'Home' },
    { href: '/governance', label: 'Governance' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Check if Securities Exchange section is active
  const isSecuritiesActive = pathname?.startsWith('/securities') || pathname?.startsWith('/projects');
  
  // Check if Projects section is active (for mobile menu)
  const isProjectsActive = pathname?.startsWith('/projects') || pathname?.startsWith('/securities/projects');

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
              {topLevelNavItems.map((item) => (
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
              
              <Dropdown
                label="Marketplace"
                items={marketplaceItems}
                user={user}
              />
              
              <NestedDropdown
                label="Securities Exchange"
                items={securitiesExchangeItems}
                user={user}
              />
              
              <Dropdown
                label="Bids"
                items={auctionsItems}
                user={user}
              />
              
              <Dropdown
                label="Analytics"
                items={analyticsItems}
                user={user}
              />
              
              {/* Vendor Central - only show for suppliers/vendors */}
              {user && (user.role === 'SUPPLIER' || user.role?.includes('VENDOR')) && (
                <Dropdown
                  label="Vendor"
                  items={vendorItems}
                  user={user}
                />
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Icon */}
              {isAuthenticated && (
                <Link href="/cart" className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              
              {isAuthenticated ? (
                <UserMenu />
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
                {topLevelNavItems.map((item) => (
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

                {/* User Account Section (Mobile) */}
                {isAuthenticated && user && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                          {user.firstName && user.lastName
                            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                            : user.firstName
                            ? user.firstName[0].toUpperCase()
                            : user.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile & Account</span>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </div>
                    </Link>
                  </>
                )}
                
                {/* Marketplace Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'marketplace' ? null : 'marketplace')}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      pathname?.startsWith('/marketplace') ||
                      pathname?.startsWith('/commodities') ||
                      pathname?.startsWith('/services')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    Marketplace
                    <svg
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        openMobileDropdown === 'marketplace' && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openMobileDropdown === 'marketplace' && (
                    <div className="pl-4 space-y-1">
                      {marketplaceItems
                        .filter((item) => {
                          if (item.adminOnly && user?.role !== 'ADMIN') return false;
                          if (item.investorOnly && user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) return false;
                          return true;
                        })
                        .map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive(item.href)
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>

                {/* Securities Exchange Dropdown - Mobile */}
                <div className="space-y-1">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'securities' ? null : 'securities')}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      isSecuritiesActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    Securities Exchange
                    <svg
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        openMobileDropdown === 'securities' && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openMobileDropdown === 'securities' && (
                    <div className="pl-4 space-y-1">
                      {/* Projects Section */}
                      <Link
                        href="/securities/projects"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setOpenMobileDropdown(null);
                          setOpenMobileSubmenu(null);
                        }}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isProjectsActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        Projects
                      </Link>

                      {/* Equity Section */}
                      <div>
                        <button
                          onClick={() => setOpenMobileSubmenu(openMobileSubmenu === 'equity' ? null : 'equity')}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname?.startsWith('/securities/equity')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          Equity
                          <svg
                            className={cn(
                              'w-4 h-4 transition-transform duration-200',
                              openMobileSubmenu === 'equity' && 'rotate-180'
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openMobileSubmenu === 'equity' && (
                          <div className="pl-4 space-y-1 mt-1">
                            <Link
                              href="/securities/equity/ordinary-shares"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                                setOpenMobileSubmenu(null);
                              }}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive('/securities/equity/ordinary-shares')
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              Ordinary Shares
                            </Link>
                            <Link
                              href="/securities/equity/preference-shares"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                                setOpenMobileSubmenu(null);
                              }}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive('/securities/equity/preference-shares')
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              Preference Shares
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Debt Section */}
                      <div>
                        <button
                          onClick={() => setOpenMobileSubmenu(openMobileSubmenu === 'debt' ? null : 'debt')}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname?.startsWith('/securities/debt')
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          Debt
                          <svg
                            className={cn(
                              'w-4 h-4 transition-transform duration-200',
                              openMobileSubmenu === 'debt' && 'rotate-180'
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openMobileSubmenu === 'debt' && (
                          <div className="pl-4 space-y-1 mt-1">
                            <Link
                              href="/securities/debt/bonds"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                                setOpenMobileSubmenu(null);
                              }}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive('/securities/debt/bonds')
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              Bonds
                            </Link>
                            <Link
                              href="/securities/debt/loans"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                                setOpenMobileSubmenu(null);
                              }}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive('/securities/debt/loans')
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              Loans
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Guarantees */}
                      <Link
                        href="/securities/guarantees"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setOpenMobileDropdown(null);
                          setOpenMobileSubmenu(null);
                        }}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive('/securities/guarantees')
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        Guarantees
                      </Link>
                    </div>
                  )}
                </div>

                {/* Bids Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'auctions' ? null : 'auctions')}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      pathname?.startsWith('/auctions') ||
                      pathname?.startsWith('/staking') ||
                      pathname?.startsWith('/rewards')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    Bids
                    <svg
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        openMobileDropdown === 'auctions' && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openMobileDropdown === 'auctions' && (
                    <div className="pl-4 space-y-1">
                      {auctionsItems
                        .filter((item) => {
                          if (item.adminOnly && user?.role !== 'ADMIN') return false;
                          if (item.investorOnly && user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) return false;
                          return true;
                        })
                        .map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive(item.href)
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>

                {/* Analytics Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'analytics' ? null : 'analytics')}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      pathname?.startsWith('/analytics') ||
                      pathname?.startsWith('/trust') ||
                      pathname?.startsWith('/learning') ||
                      pathname?.startsWith('/regulatory-reporting') ||
                      pathname?.startsWith('/investor-reporting')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    Analytics
                    <svg
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        openMobileDropdown === 'analytics' && 'rotate-180'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openMobileDropdown === 'analytics' && (
                    <div className="pl-4 space-y-1">
                      {analyticsItems
                        .filter((item) => {
                          if (item.adminOnly && user?.role !== 'ADMIN') return false;
                          if (item.investorOnly && user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) return false;
                          return true;
                        })
                        .map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive(item.href)
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>

                {/* Vendor Dropdown - Mobile */}
                {user && (user.role === 'SUPPLIER' || user.role?.includes('VENDOR')) && (
                  <div className="space-y-1">
                    <Link
                      href="/vendor-central"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-base font-medium transition-colors',
                        pathname?.startsWith('/vendor-central')
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      Vendor Dashboard
                    </Link>
                  </div>
                )}
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
