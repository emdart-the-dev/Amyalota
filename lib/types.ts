export interface Customer {
  id: string;
  fullName: string;
  passportNumber: string;
  medicalFitnessStatus: 'Fit' | 'Unfit' | 'Pending';
  agentName: string;
  visaStatus: 'Pending' | 'Processing' | 'Approved' | 'Rejected';
  documentUrl?: string;
  documentName?: string;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  entryType: 'Income' | 'Expense';
  category: 'Visa' | 'Medical' | 'Ticket' | 'Service Charge' | 'Others';
  amount: number;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  pendingVisas: number;
  approvedVisas: number;
}