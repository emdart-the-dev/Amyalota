'use client';

import { useState, useMemo } from 'react';
import { Edit, Trash2, Search, Download, Printer, TrendingUp } from 'lucide-react';
import { FinanceEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

interface FinanceTableProps {
  entries: FinanceEntry[];
  onEdit: (entry: FinanceEntry) => void;
  onRefresh: () => void;
}

export function FinanceTable({ entries, onEdit, onRefresh }: FinanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Income' | 'Expense'>('all');
  const [sortField, setSortField] = useState<keyof FinanceEntry>('transactionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      storage.deleteFinanceEntry(id);
      onRefresh();
    }
  };

  const handleSort = (field: keyof FinanceEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedEntries.map(entry => [
        entry.transactionDate,
        entry.entryType,
        entry.category,
        entry.amount,
        `"${entry.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Finance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Finance Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAndSortedEntries.map(entry => `
                <tr>
                  <td>${new Date(entry.transactionDate).toLocaleDateString()}</td>
                  <td>${entry.entryType}</td>
                  <td>${entry.category}</td>
                  <td>$${entry.amount.toFixed(2)}</td>
                  <td>${entry.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredAndSortedEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || entry.entryType === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const direction = sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * direction;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * direction;
        }
        
        return 0;
      });
  }, [entries, searchTerm, filterType, sortField, sortDirection]);

  const topExpenses = useMemo(() => {
    return entries
      .filter(entry => entry.entryType === 'Expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [entries]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, FinanceEntry[]> = {};
    filteredAndSortedEntries.forEach(entry => {
      const month = new Date(entry.transactionDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!groups[month]) groups[month] = [];
      groups[month].push(entry);
    });
    return groups;
  }, [filteredAndSortedEntries]);

  return (
    <div className="space-y-6">
      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 3 Largest Expenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topExpenses.map((expense, index) => (
              <div key={expense.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">#{index + 1}</span>
                  <span className="text-lg font-bold text-black dark:text-white">
                    ${expense.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-black dark:text-white font-medium">{expense.category}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{expense.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Finance Entries ({entries.length})
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="all">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={printReport}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th 
                  className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => handleSort('transactionDate')}
                >
                  Date {sortField === 'transactionDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => handleSort('entryType')}
                >
                  Type {sortField === 'entryType' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => handleSort('category')}
                >
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onClick={() => handleSort('amount')}
                >
                  Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-4 font-medium text-black dark:text-white">Description</th>
                <th className="text-left p-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-black dark:text-white">
                    {new Date(entry.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.entryType === 'Income' 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
                    }`}>
                      {entry.entryType}
                    </span>
                  </td>
                  <td className="p-4 text-black dark:text-white">{entry.category}</td>
                  <td className="p-4 text-black dark:text-white font-medium">
                    ${entry.amount.toFixed(2)}
                  </td>
                  <td className="p-4 text-black dark:text-white max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-1 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedEntries.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'No entries found matching your criteria.' 
                : 'No finance entries yet. Add your first entry above.'
              }
            </div>
          )}
        </div>
      </div>

      {/* Monthly Groups */}
      {Object.keys(groupedByMonth).length > 1 && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedByMonth).map(([month, monthEntries]) => {
              const income = monthEntries.filter(e => e.entryType === 'Income').reduce((sum, e) => sum + e.amount, 0);
              const expense = monthEntries.filter(e => e.entryType === 'Expense').reduce((sum, e) => sum + e.amount, 0);
              const net = income - expense;
              
              return (
                <div key={month} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-black dark:text-white mb-3">{month}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Income:</span>
                      <span className="text-sm font-medium text-black dark:text-white">${income.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expense:</span>
                      <span className="text-sm font-medium text-black dark:text-white">${expense.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                      <span className="text-sm font-medium text-black dark:text-white">Net:</span>
                      <span className={`text-sm font-bold ${net >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        ${net.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}