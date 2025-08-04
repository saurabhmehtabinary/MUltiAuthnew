'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { dataManager } from '@/utils/dataManager';
import { authManager } from '@/utils/auth';
import { Order, User } from '@/types';
import { useNotifications } from '@/components/Notification';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const getStatusColor = (status: string) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
  return statusOption?.color || 'bg-gray-100 text-gray-800';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = authManager.getCurrentUser();
  const { showSuccess, showError } = useNotifications();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      if (!currentUser) return;
      
      // Wait for data manager to initialize
      await dataManager.waitForInitialization();
      
      let filteredOrders: Order[] = [];
      let users: User[] = [];
      if (currentUser.role === 'super_admin') {
        filteredOrders = dataManager.getOrders();
        users = dataManager.getUsers();
      } else if (currentUser.role === 'org_admin') {
        filteredOrders = dataManager.getOrders().filter(o => o.organizationId === currentUser.organizationId);
        users = dataManager.getUsers().filter(u => u.organizationId === currentUser.organizationId);
        setOrgId(currentUser.organizationId);
      } else if (currentUser.role === 'org_user') {
        filteredOrders = dataManager.getOrders().filter(o => o.userId === currentUser.id);
        users = [currentUser];
        setOrgId(currentUser.organizationId);
        setUserId(currentUser.id);
      }
      setOrders(filteredOrders);
      setAllUsers(users);
    };

    initializeData();
  }, [currentUser]);

  // Apply filters
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // User filter
    const matchesUser = userFilter === 'all' || order.userId === userFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
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
          matchesDate = orderDate >= today;
          break;
        case 'yesterday':
          matchesDate = orderDate >= yesterday && orderDate < today;
          break;
        case 'last_week':
          matchesDate = orderDate >= lastWeek;
          break;
        case 'last_month':
          matchesDate = orderDate >= lastMonth;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesUser && matchesDate;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!title.trim()) {
      setError('Order title is required');
      setIsLoading(false);
      return;
    }
    if (!orgId || !userId) {
      setError('Organization and user are required');
      setIsLoading(false);
      return;
    }
    
    try {
      await dataManager.createOrder({ title, description, status: status as Order['status'], userId, organizationId: orgId });
      
      // Update orders list immediately
      refreshOrders();
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('pending');
      setSuccess('Order created successfully');
      showSuccess('Order Created', `${title} has been successfully created.`);
    } catch {
      setError('Failed to create order');
      showError('Creation Failed', 'Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setTitle(order.title);
    setDescription(order.description || '');
    setStatus(order.status);
    setOrgId(order.organizationId);
    setUserId(order.userId);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsLoading(true);
    
    if (!title.trim()) {
      setError('Order title is required');
      setIsLoading(false);
      return;
    }
    if (!orgId || !userId) {
      setError('Organization and user are required');
      setIsLoading(false);
      return;
    }
    
    try {
      await dataManager.updateOrder(editingOrder.id, { title, description, status: status as Order['status'], userId, organizationId: orgId });
      
      // Update orders list immediately
      refreshOrders();
      
      // Reset form
      setEditingOrder(null);
      setTitle('');
      setDescription('');
      setStatus('pending');
      setSuccess('Order updated successfully');
      showSuccess('Order Updated', `${title} has been successfully updated.`);
    } catch {
      setError('Failed to update order');
      showError('Update Failed', 'Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (order: Order) => {
    if (window.confirm(`Are you sure you want to delete "${order.title}"? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        const deleted = await dataManager.deleteOrder(order.id);
        if (deleted) {
          // Update orders list immediately
          refreshOrders();
          setSuccess('Order deleted');
          showSuccess('Order Deleted', `${order.title} has been successfully removed.`);
        } else {
          setError('Failed to delete order');
          showError('Deletion Failed', 'Failed to delete order. Please try again.');
        }
      } catch {
        setError('Failed to delete order');
        showError('Deletion Failed', 'Failed to delete order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const refreshOrders = () => {
    if (!currentUser) return;
    let filteredOrders: Order[] = [];
    if (currentUser.role === 'super_admin') {
      filteredOrders = dataManager.getOrders();
    } else if (currentUser.role === 'org_admin') {
      filteredOrders = dataManager.getOrders().filter(o => o.organizationId === currentUser.organizationId);
    } else if (currentUser.role === 'org_user') {
      filteredOrders = dataManager.getOrders().filter(o => o.userId === currentUser.id);
    }
    setOrders(filteredOrders);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setUserFilter('all');
    setDateFilter('all');
  };

  const getFilterCounts = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const inProgress = orders.filter(o => o.status === 'in_progress').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    return { total, pending, inProgress, completed, cancelled };
  };

  const counts = getFilterCounts();

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'org_admin', 'org_user']}>
        <Layout>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
                <p className="text-slate-600 mt-2">Create and manage orders in your organization</p>
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
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>

              <form onSubmit={editingOrder ? handleUpdate : handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                      Order Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      placeholder="Enter order title"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      disabled={isLoading}
                      required
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Enter order description"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {currentUser?.role !== 'org_user' && (
                    <div>
                      <label htmlFor="user" className="block text-sm font-medium text-slate-700 mb-2">
                        Assigned User *
                      </label>
                      <select
                        id="user"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={userId || ''}
                        onChange={e => setUserId(e.target.value)}
                        disabled={isLoading}
                        required
                      >
                        <option value="">Select User</option>
                        {allUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
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
                        <span>{editingOrder ? 'Update Order' : 'Create Order'}</span>
                      </>
                    )}
                  </button>
                  {editingOrder && (
                    <button
                      type="button"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
                      onClick={() => {
                        setEditingOrder(null);
                        setTitle('');
                        setDescription('');
                        setStatus('pending');
                        setUserId(currentUser?.role === 'org_user' ? currentUser.id : undefined);
                      }}
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
                  placeholder="Search orders by title, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              {/* Active Filter Badges */}
              {(searchTerm || statusFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Search: &quot;{searchTerm}&quot;
                      <button onClick={() => setSearchTerm('')} className="ml-2 text-indigo-600 hover:text-indigo-800">×</button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Status: {statusFilter.replace('_', ' ')}
                      <button onClick={() => setStatusFilter('all')} className="ml-2 text-yellow-600 hover:text-yellow-800">×</button>
                    </span>
                  )}
                  {userFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      User: {allUsers.find(u => u.id === userFilter)?.name || userFilter}
                      <button onClick={() => setUserFilter('all')} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Status ({counts.total})</option>
                      <option value="pending">Pending ({counts.pending})</option>
                      <option value="in_progress">In Progress ({counts.inProgress})</option>
                      <option value="completed">Completed ({counts.completed})</option>
                      <option value="cancelled">Cancelled ({counts.cancelled})</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Users</option>
                      {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
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

            {/* Orders List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                    <svg className="w-6 h-6 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    All Orders ({filteredOrders.length})
                  </h2>
                  <div className="text-sm text-slate-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-8 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {filteredOrders.map(order => {
                      const assignedUser = allUsers.find(u => u.id === order.userId);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/30 transition-colors duration-200">
                          <td className="px-8 py-4">
                            <div>
                              <div className="font-semibold text-slate-900">{order.title}</div>
                              <div className="text-sm text-slate-500">{order.description}</div>
                              <div className="text-xs text-slate-400">ID: {order.id}</div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {assignedUser?.name.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">{assignedUser?.name || 'Unknown'}</div>
                                <div className="text-xs text-slate-500">{assignedUser?.email || 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-lg hover:bg-indigo-50"
                                onClick={() => handleEdit(order)}
                                disabled={isLoading}
                                title="Edit order"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                                onClick={() => handleDelete(order)}
                                disabled={isLoading}
                                title="Delete order"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
                  <p className="text-slate-500">
                    {searchTerm || statusFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'all' 
                      ? 'Try adjusting your filters.' 
                      : 'Get started by creating your first order.'}
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