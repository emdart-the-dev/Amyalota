'use client';

import { useState } from 'react';
import { Edit, Trash2, FileText, Search } from 'lucide-react';
import { Customer } from '@/lib/types';
import { storage } from '@/lib/storage';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onRefresh: () => void;
}

export function CustomerTable({ customers, onEdit, onRefresh }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Customer>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      storage.deleteCustomer(id);
      onRefresh();
    }
  };

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => 
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.agentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-black dark:text-white font-semibold';
      case 'Rejected': return 'text-gray-600 dark:text-gray-400';
      case 'Processing': return 'text-black dark:text-white';
      case 'Fit': return 'text-black dark:text-white font-semibold';
      case 'Unfit': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-500 dark:text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Customers ({customers.length})
          </h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th 
                className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('fullName')}
              >
                Full Name {sortField === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="text-left p-4 font-medium text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('passportNumber')}
              >
                Passport {sortField === 'passportNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-4 font-medium text-black dark:text-white">Medical Status</th>
              <th className="text-left p-4 font-medium text-black dark:text-white">Agent</th>
              <th className="text-left p-4 font-medium text-black dark:text-white">Visa Status</th>
              <th className="text-left p-4 font-medium text-black dark:text-white">Document</th>
              <th className="text-left p-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-4 text-black dark:text-white">{customer.fullName}</td>
                <td className="p-4 text-black dark:text-white">{customer.passportNumber}</td>
                <td className={`p-4 ${getStatusColor(customer.medicalFitnessStatus)}`}>
                  {customer.medicalFitnessStatus}
                </td>
                <td className="p-4 text-black dark:text-white">{customer.agentName}</td>
                <td className={`p-4 ${getStatusColor(customer.visaStatus)}`}>
                  {customer.visaStatus}
                </td>
                <td className="p-4">
                  {customer.documentUrl ? (
                    <a
                      href={customer.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-black dark:text-white hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500">No document</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-1 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
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

        {filteredAndSortedCustomers.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No customers found matching your search.' : 'No customers yet. Add your first customer above.'}
          </div>
        )}
      </div>
    </div>
  );
}