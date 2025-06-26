'use client';

import { useState, useEffect } from 'react';
import { Download, Printer, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Customer, FinanceEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

export default function ReportsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setCustomers(storage.getCustomers());
    setFinanceEntries(storage.getFinanceEntries());
  }, []);

  const filteredEntries = financeEntries.filter(entry => 
    entry.transactionDate >= dateRange.start && entry.transactionDate <= dateRange.end
  );

  const totalIncome = filteredEntries
    .filter(entry => entry.entryType === 'Income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpense = filteredEntries
    .filter(entry => entry.entryType === 'Expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const visaStatusCounts = customers.reduce((acc, customer) => {
    acc[customer.visaStatus] = (acc[customer.visaStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = { income: 0, expense: 0 };
    }
    if (entry.entryType === 'Income') {
      acc[entry.category].income += entry.amount;
    } else {
      acc[entry.category].expense += entry.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Business Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section h2 { border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .stat-box { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Business Report</h1>
            <p>Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2>Financial Summary</h2>
            <div class="stat-grid">
              <div class="stat-box">
                <div>Total Income</div>
                <div class="stat-value">$${totalIncome.toFixed(2)}</div>
              </div>
              <div class="stat-box">
                <div>Total Expense</div>
                <div class="stat-value">$${totalExpense.toFixed(2)}</div>
              </div>
              <div class="stat-box">
                <div>Net Balance</div>
                <div class="stat-value">$${netBalance.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Customer Summary</h2>
            <p>Total Customers: ${customers.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Visa Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(visaStatusCounts).map(([status, count]) => 
                  `<tr><td>${status}</td><td>${count}</td></tr>`
                ).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Category Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(categoryBreakdown).map(([category, amounts]) => 
                  `<tr>
                    <td>${category}</td>
                    <td>$${amounts.income.toFixed(2)}</td>
                    <td>$${amounts.expense.toFixed(2)}</td>
                    <td>$${(amounts.income - amounts.expense).toFixed(2)}</td>
                  </tr>`
                ).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCSV = () => {
    const headers = ['Type', 'Category', 'Value'];
    const data = [
      ['Summary', 'Total Income', totalIncome.toFixed(2)],
      ['Summary', 'Total Expense', totalExpense.toFixed(2)],
      ['Summary', 'Net Balance', netBalance.toFixed(2)],
      ['Summary', 'Total Customers', customers.length.toString()],
      ...Object.entries(visaStatusCounts).map(([status, count]) => 
        ['Visa Status', status, count.toString()]
      ),
      ...Object.entries(categoryBreakdown).map(([category, amounts]) => 
        ['Category Income', category, amounts.income.toFixed(2)]
      ),
      ...Object.entries(categoryBreakdown).map(([category, amounts]) => 
        ['Category Expense', category, amounts.expense.toFixed(2)]
      ),
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive business reports
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Report Period
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-black dark:text-white">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expense</p>
              <p className="text-2xl font-bold text-black dark:text-white">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                ${netBalance.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Summary */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Customer Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(visaStatusCounts).map(([status, count]) => (
            <div key={status} className="text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-black dark:text-white">{count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left p-4 font-medium text-black dark:text-white">Category</th>
                <th className="text-left p-4 font-medium text-black dark:text-white">Income</th>
                <th className="text-left p-4 font-medium text-black dark:text-white">Expense</th>
                <th className="text-left p-4 font-medium text-black dark:text-white">Net</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryBreakdown).map(([category, amounts]) => {
                const net = amounts.income - amounts.expense;
                return (
                  <tr key={category} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="p-4 text-black dark:text-white font-medium">{category}</td>
                    <td className="p-4 text-black dark:text-white">${amounts.income.toFixed(2)}</td>
                    <td className="p-4 text-black dark:text-white">${amounts.expense.toFixed(2)}</td>
                    <td className={`p-4 font-medium ${net >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      ${net.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {Object.keys(categoryBreakdown).length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No financial data for the selected period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}