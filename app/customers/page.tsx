'use client';

import { useState, useEffect } from 'react';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Customer } from '@/lib/types';
import { storage } from '@/lib/storage';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = () => {
    setCustomers(storage.getCustomers());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleFormSuccess = () => {
    loadCustomers();
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer information and visa status
          </p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Add Customer
          </button>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      )}

      <CustomerTable
        customers={customers}
        onEdit={handleEdit}
        onRefresh={loadCustomers}
      />
    </div>
  );
}