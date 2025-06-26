'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, TrendingDown, FileText, CheckCircle, Calendar, PieChart } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { storage } from '@/lib/storage';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    pendingVisas: 0,
    approvedVisas: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadStats = () => {
      const customers = storage.getCustomers();
      const financeEntries = storage.getFinanceEntries();
      
      const totalIncome = financeEntries
        .filter(entry => entry.entryType === 'Income')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const totalExpense = financeEntries
        .filter(entry => entry.entryType === 'Expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const pendingVisas = customers.filter(c => c.visaStatus === 'Pending').length;
      const approvedVisas = customers.filter(c => c.visaStatus === 'Approved').length;
      
      setStats({
        totalCustomers: customers.length,
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        pendingVisas,
        approvedVisas,
      });

      // Generate recent activity
      const recentCustomers = customers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      const recentFinance = financeEntries
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      const activity = [
        ...recentCustomers.map(c => ({
          type: 'customer',
          description: `New customer: ${c.fullName}`,
          date: c.createdAt,
          status: c.visaStatus
        })),
        ...recentFinance.map(f => ({
          type: 'finance',
          description: `${f.entryType}: ${f.description}`,
          date: f.createdAt,
          amount: f.amount,
          entryType: f.entryType
        }))
      ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

      setRecentActivity(activity);
    };

    loadStats();
    
    // Refresh every 5 seconds to catch updates from other tabs
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      format: (val: number) => val.toString(),
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Income',
      value: stats.totalIncome,
      icon: TrendingUp,
      format: (val: number) => `$${val.toFixed(2)}`,
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: 'Total Expense',
      value: stats.totalExpense,
      icon: TrendingDown,
      format: (val: number) => `$${val.toFixed(2)}`,
      change: '+3.1%',
      trend: 'up'
    },
    {
      title: 'Net Balance',
      value: stats.netBalance,
      icon: DollarSign,
      format: (val: number) => `$${val.toFixed(2)}`,
      className: stats.netBalance >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400',
      change: stats.netBalance >= 0 ? '+15.3%' : '-5.2%',
      trend: stats.netBalance >= 0 ? 'up' : 'down'
    },
    {
      title: 'Pending Visas',
      value: stats.pendingVisas,
      icon: FileText,
      format: (val: number) => val.toString(),
      change: '-2.1%',
      trend: 'down'
    },
    {
      title: 'Approved Visas',
      value: stats.approvedVisas,
      icon: CheckCircle,
      format: (val: number) => val.toString(),
      change: '+18.7%',
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your business operations for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-black dark:text-white">{new Date().getDate()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'short' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <card.icon className="w-6 h-6 text-black dark:text-white" />
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                card.trend === 'up' 
                  ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {card.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.className || 'text-black dark:text-white'}`}>
                {card.format(card.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="/customers"
              className="group block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
                  <Users className="w-5 h-5 text-black dark:text-white" />
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white">Manage Customers</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or view customer records</p>
                </div>
              </div>
            </a>
            <a
              href="/finance"
              className="group block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
                  <DollarSign className="w-5 h-5 text-black dark:text-white" />
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white">Track Finances</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Record income and expenses</p>
                </div>
              </div>
            </a>
            <a
              href="/reports"
              className="group block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
                  <FileText className="w-5 h-5 text-black dark:text-white" />
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white">View Reports</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generate and export reports</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No recent activity</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start by adding your first customer or finance entry
                </p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-900 rounded-lg">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    {activity.type === 'customer' ? (
                      <Users className="w-4 h-4 text-black dark:text-white" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-black dark:text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.amount && (
                    <div className={`text-sm font-medium ${
                      activity.entryType === 'Income' 
                        ? 'text-black dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      ${activity.amount.toFixed(2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {(stats.totalCustomers > 0 || stats.totalIncome > 0 || stats.totalExpense > 0) && (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                {((stats.approvedVisas / Math.max(stats.totalCustomers, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Visa Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                ${stats.totalIncome > 0 ? (stats.totalIncome / Math.max(stats.totalCustomers, 1)).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Income per Customer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white mb-1">
                ${stats.totalExpense > 0 ? (stats.totalExpense / Math.max(stats.totalCustomers, 1)).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Expense per Customer</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${stats.netBalance >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {stats.totalIncome > 0 ? ((stats.netBalance / stats.totalIncome) * 100).toFixed(1) : '0.0'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}