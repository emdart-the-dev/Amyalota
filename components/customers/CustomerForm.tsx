'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Customer } from '@/lib/types';
import { storage } from '@/lib/storage';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    fullName: customer?.fullName || '',
    passportNumber: customer?.passportNumber || '',
    medicalFitnessStatus: customer?.medicalFitnessStatus || 'Pending' as const,
    agentName: customer?.agentName || '',
    visaStatus: customer?.visaStatus || 'Pending' as const,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
    if (!formData.agentName.trim()) newErrors.agentName = 'Agent name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate file upload
      let documentUrl = customer?.documentUrl;
      let documentName = customer?.documentName;
      
      if (file) {
        // In a real app, you'd upload to a server
        documentUrl = URL.createObjectURL(file);
        documentName = file.name;
      }

      if (customer) {
        storage.updateCustomer(customer.id, {
          ...formData,
          documentUrl,
          documentName,
        });
      } else {
        storage.addCustomer({
          ...formData,
          documentUrl,
          documentName,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Passport Number *
            </label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Enter passport number"
            />
            {errors.passportNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{errors.passportNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Medical Fitness Status
            </label>
            <select
              value={formData.medicalFitnessStatus}
              onChange={(e) => setFormData({ ...formData, medicalFitnessStatus: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="Pending">Pending</option>
              <option value="Fit">Fit</option>
              <option value="Unfit">Unfit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.agentName}
              onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Enter agent name"
            />
            {errors.agentName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{errors.agentName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Visa Status
            </label>
            <select
              value={formData.visaStatus}
              onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Upload Document
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {customer?.documentName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current: {customer.documentName}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}