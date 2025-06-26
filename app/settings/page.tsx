'use client';

import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, RefreshCw, Save, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({
    customers: 0,
    financeEntries: 0,
    storageUsed: '0 KB'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const customers = storage.getCustomers();
      const financeEntries = storage.getFinanceEntries();
      
      // Calculate approximate storage usage
      const dataSize = JSON.stringify({ customers, financeEntries }).length;
      const sizeInKB = (dataSize / 1024).toFixed(2);
      
      setStats({
        customers: customers.length,
        financeEntries: financeEntries.length,
        storageUsed: `${sizeInKB} KB`
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const customers = storage.getCustomers();
      const financeEntries = storage.getFinanceEntries();
      const theme = storage.getTheme();
      
      const exportData = {
        customers,
        financeEntries,
        theme,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.customers || !importData.financeEntries) {
        throw new Error('Invalid data format');
      }

      // Backup current data first
      const currentData = {
        customers: storage.getCustomers(),
        financeEntries: storage.getFinanceEntries(),
        theme: storage.getTheme()
      };
      localStorage.setItem('backup_before_import', JSON.stringify(currentData));

      // Import new data
      storage.saveCustomers(importData.customers);
      storage.saveFinanceEntries(importData.financeEntries);
      if (importData.theme) {
        storage.setTheme(importData.theme);
      }

      alert('Data imported successfully! The page will refresh to apply changes.');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const clearAllData = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }

    // Create backup before clearing
    const backupData = {
      customers: storage.getCustomers(),
      financeEntries: storage.getFinanceEntries(),
      theme: storage.getTheme(),
      clearedDate: new Date().toISOString()
    };
    localStorage.setItem('backup_before_clear', JSON.stringify(backupData));

    // Clear data
    storage.saveCustomers([]);
    storage.saveFinanceEntries([]);
    
    setShowClearConfirm(false);
    alert('All data cleared successfully! The page will refresh.');
    window.location.reload();
  };

  const restoreFromBackup = () => {
    const backup = localStorage.getItem('backup_before_clear');
    if (!backup) {
      alert('No backup found to restore from.');
      return;
    }

    try {
      const backupData = JSON.parse(backup);
      storage.saveCustomers(backupData.customers);
      storage.saveFinanceEntries(backupData.financeEntries);
      
      alert('Data restored successfully! The page will refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your application preferences and data
        </p>
      </div>

      {/* App Statistics */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Application Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-black dark:text-white">{stats.customers}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-black dark:text-white">{stats.financeEntries}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Finance Entries</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-black dark:text-white">{stats.storageUsed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black dark:text-white">Theme</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current theme: {theme === 'light' ? 'Light' : 'Dark'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-black dark:text-white">Export All Data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download a complete backup of your customers and finance data
              </p>
            </div>
            <button
              onClick={exportAllData}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          {/* Import Data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-black dark:text-white">Import Data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a backup file to restore your data
              </p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import Data'}
              <input
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* Restore Backup */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-black dark:text-white">Restore from Backup</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restore data from the last automatic backup
              </p>
            </div>
            <button
              onClick={restoreFromBackup}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Restore Backup
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Danger Zone
        </h3>
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-black dark:text-white">Clear All Data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete all customers and finance data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              {showClearConfirm && (
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={clearAllData}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showClearConfirm
                    ? 'bg-gray-600 dark:bg-gray-400 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-300'
                    : 'border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {showClearConfirm ? 'Confirm Clear All' : 'Clear All Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong className="text-black dark:text-white">Application:</strong> Customer & Finance Manager</p>
          <p><strong className="text-black dark:text-white">Version:</strong> 1.0.0</p>
          <p><strong className="text-black dark:text-white">Build:</strong> Next.js with TypeScript</p>
          <p><strong className="text-black dark:text-white">Storage:</strong> Browser Local Storage</p>
          <p><strong className="text-black dark:text-white">Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}