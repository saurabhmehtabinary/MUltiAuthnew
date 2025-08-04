'use client';

import { useState, useEffect } from 'react';
import { dataManager } from '@/utils/dataManager';
import { testDataPersistence, resetDataToDefaults } from '@/utils/dataPersistenceTest';

export default function DataManagementPage() {
  const [data, setData] = useState({
    users: 0,
    organizations: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dataManager.waitForInitialization();
    setData({
      users: dataManager.getUsers().length,
      organizations: dataManager.getOrganizations().length,
      orders: dataManager.getOrders().length
    });
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestPersistence = async () => {
    setLoading(true);
    addLog('Starting data persistence test...');
    
    try {
      const result = await testDataPersistence();
      setData(result);
      addLog(`Test completed. Users: ${result.users}, Orgs: ${result.organizations}, Orders: ${result.orders}`);
    } catch (error) {
      addLog(`Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    addLog('Resetting data to defaults...');
    
    try {
      await resetDataToDefaults();
      await loadData();
      addLog('Data reset completed');
    } catch (error) {
      addLog(`Reset failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    addLog('Refreshing data...');
    await loadData();
    addLog('Data refreshed');
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Data Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Data Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Users:</span>
              <span className="font-semibold">{data.users}</span>
            </div>
            <div className="flex justify-between">
              <span>Organizations:</span>
              <span className="font-semibold">{data.organizations}</span>
            </div>
            <div className="flex justify-between">
              <span>Orders:</span>
              <span className="font-semibold">{data.orders}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleTestPersistence}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Data Persistence'}
            </button>
            
            <button
              onClick={handleResetData}
              disabled={loading}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset to Defaults'}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
        <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No activity logs yet. Run a test to see logs.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Test Data Persistence:</strong> Creates test data and verifies it's saved to JSON files.</p>
          <p><strong>Reset to Defaults:</strong> Restores the original default data.</p>
          <p><strong>Refresh Data:</strong> Reloads data from the current state.</p>
          <p><strong>Note:</strong> Check the browser console for detailed logs about data operations.</p>
        </div>
      </div>
    </div>
  );
} 