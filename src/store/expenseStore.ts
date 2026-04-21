import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Transaction, ExpenseStats } from '../types';

interface ExpenseStore {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getStats: () => ExpenseStats;
  getCategoryTotal: (category: string) => number;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching:', error);
    } else {
      set({ transactions: data || [] });
    }
    set({ loading: false });
  },

  addTransaction: async (transaction) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userData.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding:', error);
    } else if (data) {
      set((state) => ({ 
        transactions: [data, ...state.transactions] 
      }));
    }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id)
      }));
    }
  },

  getStats: () => {
    const transactions = get().transactions;
    if (transactions.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0, count: 0 };
    }
    
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((a, b) => a + b, 0);
    
    return {
      total,
      average: total / transactions.length,
      highest: Math.max(...amounts),
      lowest: Math.min(...amounts),
      count: transactions.length
    };
  },

  getCategoryTotal: (category) => {
    const transactions = get().transactions;
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  }
}));