'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import { dataManager } from '@/utils/dataManager';
import { authManager } from '@/utils/auth';
import { User } from '@/types';

interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalOrders: number;
  recentOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

const getRoleDisplayName = (role: string) => {
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin': return 'from-purple-500 to-pink-500';
    case 'org_admin': return 'from-blue-500 to-cyan-500';
    case 'org_user': return 'from-green-500 to-emerald-500';
    default: return 'from-gray-500 to-slate-500';
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalOrders: 0,
    recentOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authManager.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const organizations = dataManager.getOrganizations();
      const users = dataManager.getUsers();
      const orders = dataManager.getOrders();

      let filteredUsers = users;
      let filteredOrders = orders;

      if (user.role === 'org_admin') {
        filteredUsers = users.filter(u => u.organizationId === user.organizationId);
        filteredOrders = orders.filter(o => o.organizationId === user.organizationId);
      } else if (user.role === 'org_user') {
        filteredOrders = orders.filter(o => o.userId === user.id);
      }

      const recentOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate > weekAgo;
      }).length;

      const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
      const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

      setStats({
        totalOrganizations: user.role === 'super_admin' ? organizations.length : 1,
        totalUsers: filteredUsers.length,
        totalOrders: filteredOrders.length,
        recentOrders,
        pendingOrders,
        completedOrders
      });
    }
  }, []);

  if (!currentUser) {
    return null;
  }

  const quickActions = [
    {
      name: 'Create Organization',
      href: '/organizations',
      icon: '🏢',
      color: 'from-blue-500 to-cyan-500',
      roles: ['super_admin']
    },
    {
      name: 'Manage Users',
      href: '/users',
      icon: '👥',
      color: 'from-green-500 to-emerald-500',
      roles: ['super_admin', 'org_admin']
    },
    {
      name: 'Create Order',
      href: '/orders',
      icon: '📋',
      color: 'from-purple-500 to-pink-500',
      roles: ['super_admin', 'org_admin', 'org_user']
    },
    {
      name: 'View Orders',
      href: '/orders',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      roles: ['super_admin', 'org_admin', 'org_user']
    }
  ].filter(action => action.roles.includes(currentUser.role));

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200/50">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${getRoleColor(currentUser.role)} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-2xl">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Welcome back, {currentUser.name}! 👋
                </h1>
                <p className="text-slate-600 mt-1">
                  Here's what's happening in your {getRoleDisplayName(currentUser.role).toLowerCase()} workspace
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(currentUser.role)} text-white shadow-sm`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-sm">{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Organizations</p>
                  <p className="text-4xl font-bold">{stats.totalOrganizations}</p>
                </div>
                <div className="text-4xl">🏢</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-blue-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Active organizations
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Users</p>
                  <p className="text-4xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-green-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Registered users
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                  <p className="text-4xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-purple-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  All orders
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Recent Orders</p>
                  <p className="text-4xl font-bold">{stats.recentOrders}</p>
                </div>
                <div className="text-4xl">🕒</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-orange-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last 7 days
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Orders</p>
                  <p className="text-4xl font-bold">{stats.pendingOrders}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-yellow-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Awaiting action
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed Orders</p>
                  <p className="text-4xl font-bold">{stats.completedOrders}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-emerald-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Successfully delivered
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="group bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200`}>
                      <span className="text-2xl">{action.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors duration-200">
                        {action.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Click to access
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Welcome to your dashboard!</p>
                  <p className="text-sm text-slate-500">Your workspace is ready for you to start managing your data.</p>
                </div>
                <span className="text-xs text-slate-400">Just now</span>
              </div>
            </div>
          </div>

          {/* Data Management Link - Only for Super Admin */}
          {currentUser?.role === 'super_admin' && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Data Management
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-purple-50/50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Data Persistence Testing</p>
                    <p className="text-sm text-slate-500">Test and verify data persistence functionality</p>
                  </div>
                  <a
                    href="/data-management"
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          )}


        </div>
      </Layout>
    </AuthGuard>
  );
} 