'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { dataManager } from '@/utils/dataManager';
import { Organization } from '@/types';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOrganizations(dataManager.getOrganizations());
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!name.trim()) {
      setError('Organization name is required');
      setIsLoading(false);
      return;
    }
    
    try {
      await dataManager.createOrganization({ name, description });
      setOrganizations(dataManager.getOrganizations());
      setName('');
      setDescription('');
      setSuccess('Organization created successfully');
    } catch {
      setError('Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setName(org.name);
    setDescription(org.description || '');
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setIsLoading(true);
    
    if (!name.trim()) {
      setError('Organization name is required');
      setIsLoading(false);
      return;
    }
    
    try {
      await dataManager.updateOrganization(editingOrg.id, { name, description });
      setOrganizations(dataManager.getOrganizations());
      setEditingOrg(null);
      setName('');
      setDescription('');
      setSuccess('Organization updated successfully');
    } catch {
      setError('Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (org: Organization) => {
    if (window.confirm(`Delete organization "${org.name}"?`)) {
      setIsLoading(true);
      try {
        const deleted = await dataManager.deleteOrganization(org.id);
        if (deleted) {
          setOrganizations(dataManager.getOrganizations());
          setSuccess('Organization deleted');
        } else {
          setError('Failed to delete organization');
        }
      } catch {
        setError('Failed to delete organization');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin']}>
        <Layout>
          <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Organizations</h1>

            <form onSubmit={editingOrg ? handleUpdate : handleCreate} className="mb-6 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Organization Name"
                  className="w-full border px-3 py-2 rounded"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  className="w-full border px-3 py-2 rounded"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div>
                <button
                  type="submit"
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (editingOrg ? 'Update Organization' : 'Create Organization')}
                </button>
                {editingOrg && (
                  <button
                    type="button"
                    className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    onClick={() => {
                      setEditingOrg(null);
                      setName('');
                      setDescription('');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 className="text-lg font-semibold mb-2">All Organizations</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id}>
                    <td className="p-2 border">{org.name}</td>
                    <td className="p-2 border">{org.description}</td>
                    <td className="p-2 border">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => handleEdit(org)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(org)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Layout>
      </RoleGuard>
    </AuthGuard>
  );
}