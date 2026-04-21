export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface ExpenseStats {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
}