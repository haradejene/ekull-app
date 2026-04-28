'use client';

import { useEffect, useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, LogOut, Trash2 } from 'lucide-react';

const categories = [
  { name: 'Food', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { name: 'Bills', icon: '📄', color: '#96CEB4' },
  { name: 'Entertainment', icon: '🎬', color: '#FFEAA7' },
  { name: 'Health', icon: '💊', color: '#DDA0DD' },
  { name: 'Other', icon: '📌', color: '#95A5A6' },
];

export default function Dashboard() {
  const { transactions, fetchTransactions, addTransaction, deleteTransaction, getStats } = useExpenseStore();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await addTransaction({
      amount: parseFloat(amount),
      category,
      description: description || 'No description',
      date,
    });

    toast.success('Expense added!');
    setAmount('');
    setDescription('');
    setShowForm(false);
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">💰 Ekull</h1>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-20">
        {/* Stats Cards */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <p className="text-sm opacity-90">Total Spent</p>
          <p className="text-4xl font-bold mt-1">${stats.total.toFixed(2)}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-75">Average</p>
              <p className="text-sm font-semibold">${stats.average.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Transactions</p>
              <p className="text-sm font-semibold">{stats.count}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Highest</p>
              <p className="text-sm font-semibold">${stats.highest.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 right-4 z-10 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Plus size={24} />
        </button>

        {/* Expense List */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Expenses</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No expenses yet</p>
              <p className="text-sm mt-1">Tap the + button to add</p>
            </div>
          ) : (
            transactions.map((transaction) => {
              const cat = categories.find(c => c.name === transaction.category);
              return (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: cat?.color + '20' }}
                      >
                        {cat?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{transaction.category}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-800">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Lunch, Uber, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}