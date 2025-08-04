'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authManager } from '@/utils/auth';
import { User } from '@/types';
import { NotificationContainer } from './Notification';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const currentUser = authManager.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    authManager.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">Loading your workspace...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we prepare everything</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['super_admin', 'org_admin', 'org_user'] },
    { name: 'Organizations', href: '/organizations', icon: '🏢', roles: ['super_admin'] },
    { name: 'Users', href: '/users', icon: '👥', roles: ['super_admin', 'org_admin'] },
    { name: 'Orders', href: '/orders', icon: '📋', roles: ['super_admin', 'org_admin', 'org_user'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'org_admin': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'org_user': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Desktop Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Multi-Tenant App
                  </h1>
                  <p className="text-xs text-slate-500 -mt-1">Enterprise Management</p>
                </div>
              </div>
              
              <div className="hidden md:flex md:ml-10 space-x-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <div className="relative">
                  <div className={`w-10 h-10 ${getRoleBadgeColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(user.role)} shadow-md`}>
                    {user.role.replace('_', ' ')}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-slate-200">
                <div className="flex items-center px-3">
                  <div className={`w-10 h-10 ${getRoleBadgeColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-semibold text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(user.role)} mt-1`}>
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 min-h-[calc(100vh-12rem)] overflow-hidden">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
      
      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
} 