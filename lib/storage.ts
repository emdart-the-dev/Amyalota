import { Customer, FinanceEntry } from './types';

const CUSTOMERS_KEY = 'customers';
const FINANCE_ENTRIES_KEY = 'finance_entries';
const THEME_KEY = 'theme_preference';

export const storage = {
  // Customer operations
  getCustomers: (): Customer[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCustomers: (customers: Customer[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customers = storage.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    storage.saveCustomers(customers);
    return newCustomer;
  },

  updateCustomer: (id: string, updates: Partial<Customer>): void => {
    const customers = storage.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      storage.saveCustomers(customers);
    }
  },

  deleteCustomer: (id: string): void => {
    const customers = storage.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    storage.saveCustomers(filtered);
  },

  // Finance operations
  getFinanceEntries: (): FinanceEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(FINANCE_ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFinanceEntries: (entries: FinanceEntry[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FINANCE_ENTRIES_KEY, JSON.stringify(entries));
  },

  addFinanceEntry: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>): FinanceEntry => {
    const entries = storage.getFinanceEntries();
    const newEntry: FinanceEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    storage.saveFinanceEntries(entries);
    return newEntry;
  },

  updateFinanceEntry: (id: string, updates: Partial<FinanceEntry>): void => {
    const entries = storage.getFinanceEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      storage.saveFinanceEntries(entries);
    }
  },

  deleteFinanceEntry: (id: string): void => {
    const entries = storage.getFinanceEntries();
    const filtered = entries.filter(e => e.id !== id);
    storage.saveFinanceEntries(filtered);
  },

  // Theme operations
  getTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    const theme = localStorage.getItem(THEME_KEY);
    return (theme as 'light' | 'dark') || 'light';
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, theme);
  },
};