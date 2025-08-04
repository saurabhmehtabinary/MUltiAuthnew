'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { dataManager } from '@/utils/dataManager';
import { authManager } from '@/utils/auth';
import { User } from '@/types';
import { useNotifications } from '@/components/Notification';

const ROLES = [
  { value: 'org_admin', label: 'Org Admin', color: 'from-blue-500 to-cyan-500' },
  { value: 'org_user', label: 'Org User', color: 'from-green-500 to-emerald-500' },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin': return 'from-purple-500 to-pink-500';
    case 'org_admin': return 'from-blue-500 to-cyan-500';
    case 'org_user': return 'from-green-500 to-emerald-500';
    default: return 'from-gray-500 to-slate-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('org_user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const [allOrgs, setAllOrgs] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = authManager.getCurrentUser();
  const { showSuccess, showError } = useNotifications();

  // Filter states
  const [roleFilter, setRoleFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      if (!currentUser) return;
      
      // Wait for data manager to initialize
      await dataManager.waitForInitialization();
      
      if (currentUser.role === 'super_admin') {
        setUsers(dataManager.getUsers());
        setAllOrgs(dataManager.getOrganizations().map(o => ({ id: o.id, name: o.name })));
      } else if (currentUser.role === 'org_admin') {
        setUsers(dataManager.getUsers().filter(u => u.organizationId === currentUser.organizationId));
        setOrgId(currentUser.organizationId);
      }
    };

    initializeData();
  }, [currentUser]);

  // Apply filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Organization filter
    const matchesOrganization = organizationFilter === 'all' || user.organizationId === organizationFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      switch (dateFilter) {
        case 'today':
          matchesDate = userDate >= today;
          break;
        case 'yesterday':
          matchesDate = userDate >= yesterday && userDate < today;
          break;
        case 'last_week':
          matchesDate = userDate >= lastWeek;
          break;
        case 'last_month':
          matchesDate = userDate >= lastMonth;
          break;
      }
    }

    return matchesSearch && matchesRole && matchesOrganization && matchesDate;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      setIsLoading(false);
      return;
    }
    if (!orgId) {
      setError('Organization is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const user = await dataManager.createUser({ name, email, role: role as User['role'], organizationId: orgId });
      
      // Update users list immediately
      if (currentUser?.role === 'super_admin') {
        setUsers(dataManager.getUsers());
      } else {
        setUsers(dataManager.getUsers().filter(u => u.organizationId === orgId));
      }
      
      // Reset form
      setName('');
      setEmail('');
      setRole('org_user');
      setSuccess('User created successfully');
      showSuccess('User Created', `${name} has been successfully added to the system.`);
    } catch (error) {
      setError('Failed to create user');
      showError('Creation Failed', 'Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setOrgId(user.organizationId);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsLoading(true);
    
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      setIsLoading(false);
      return;
    }
    if (!orgId) {
      setError('Organization is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const updated = await dataManager.updateUser(editingUser.id, { name, email, role: role as User['role'], organizationId: orgId });
      
      // Update users list immediately
      if (currentUser?.role === 'super_admin') {
        setUsers(dataManager.getUsers());
      } else {
        setUsers(dataManager.getUsers().filter(u => u.organizationId === orgId));
      }
      
      // Reset form
      setEditingUser(null);
      setName('');
      setEmail('');
      setRole('org_user');
      setSuccess('User updated successfully');
      showSuccess('User Updated', `${name}'s information has been successfully updated.`);
    } catch (error) {
      setError('Failed to update user');
      showError('Update Failed', 'Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        const deleted = await dataManager.deleteUser(user.id);
        if (deleted) {
          // Update users list immediately
          if (currentUser?.role === 'super_admin') {
            setUsers(dataManager.getUsers());
          } else {
            setUsers(dataManager.getUsers().filter(u => u.organizationId === orgId));
          }
          setSuccess('User deleted');
          showSuccess('User Deleted', `${user.name} has been successfully removed from the system.`);
        } else {
          setError('Failed to delete user');
          showError('Deletion Failed', 'Failed to delete user. Please try again.');
        }
      } catch (error) {
        setError('Failed to delete user');
        showError('Deletion Failed', 'Failed to delete user. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('org_user');
    setOrgId(currentUser?.organizationId);
    setError('');
    setSuccess('');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setOrganizationFilter('all');
    setDateFilter('all');
  };

  const getFilterCounts = () => {
    const total = users.length;
    const superAdmin = users.filter(u => u.role === 'super_admin').length;
    const orgAdmin = users.filter(u => u.role === 'org_admin').length;
    const orgUser = users.filter(u => u.role === 'org_user').length;
    return { total, superAdmin, orgAdmin, orgUser };
  };

  const counts = getFilterCounts();

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'org_admin']}>
        <Layout>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
                <p className="text-slate-600 mt-2">Create and manage users in your organization</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Create/Edit Form */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>

              <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      disabled={isLoading}
                      required
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  {currentUser?.role === 'super_admin' && (
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-2">
                        Organization *
                      </label>
                      <select
                        id="organization"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={orgId || ''}
                        onChange={e => setOrgId(e.target.value)}
                        disabled={isLoading}
                        required
                      >
                        <option value="">Select Organization</option>
                        {allOrgs.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 text-sm font-medium">{success}</span>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{editingUser ? 'Update User' : 'Create User'}</span>
                      </>
                    )}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Quick Search Bar */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users by name, email, role, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              {/* Active Filter Badges */}
              {(searchTerm || roleFilter !== 'all' || organizationFilter !== 'all' || dateFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="ml-2 text-indigo-600 hover:text-indigo-800">×</button>
                    </span>
                  )}
                  {roleFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Role: {roleFilter.replace('_', ' ')}
                      <button onClick={() => setRoleFilter('all')} className="ml-2 text-purple-600 hover:text-purple-800">×</button>
                    </span>
                  )}
                  {organizationFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Organization: {allOrgs.find(o => o.id === organizationFilter)?.name || organizationFilter}
                      <button onClick={() => setOrganizationFilter('all')} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Date: {dateFilter.replace('_', ' ')}
                      <button onClick={() => setDateFilter('all')} className="ml-2 text-green-600 hover:text-green-800">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filters - Now Above the List */}
            {showFilters && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  >
                    Reset all filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Roles ({counts.total})</option>
                      <option value="super_admin">Super Admin ({counts.superAdmin})</option>
                      <option value="org_admin">Org Admin ({counts.orgAdmin})</option>
                      <option value="org_user">Org User ({counts.orgUser})</option>
                    </select>
                  </div>
                  {currentUser?.role === 'super_admin' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                      <select
                        value={organizationFilter}
                        onChange={(e) => setOrganizationFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="all">All Organizations</option>
                        {allOrgs.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="last_week">Last 7 Days</option>
                      <option value="last_month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                    <svg className="w-6 h-6 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    All Users ({filteredUsers.length})
                  </h2>
                  <div className="text-sm text-slate-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/30 transition-colors duration-200">
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                              <span className="text-white font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-sm`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm text-slate-600">
                          {user.organizationId || '-'}
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                            Active
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-lg hover:bg-indigo-50"
                              onClick={() => handleEdit(user)}
                              disabled={isLoading}
                              title="Edit user"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                              onClick={() => handleDelete(user)}
                              disabled={isLoading}
                              title="Delete user"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-500">
                    {searchTerm || roleFilter !== 'all' || organizationFilter !== 'all' || dateFilter !== 'all' 
                      ? 'Try adjusting your filters.' 
                      : 'Get started by creating your first user.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Layout>
      </RoleGuard>
    </AuthGuard>
  );
}