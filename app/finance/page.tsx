'use client';

import { useState, useEffect } from 'react';
import { FinanceForm } from '@/components/finance/FinanceForm';
import { FinanceTable } from '@/components/finance/FinanceTable';
import { FinanceEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadEntries = () => {
    setEntries(storage.getFinanceEntries());
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleFormSuccess = () => {
    loadEntries();
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Finance</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track income and expenses for your business
          </p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <FinanceForm
          entry={editingEntry || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      )}

      <FinanceTable
        entries={entries}
        onEdit={handleEdit}
        onRefresh={loadEntries}
      />
    </div>
  );
}