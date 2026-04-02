export type TransactionType = 'Expense' | 'Income';

export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Health' | 'Entertainment' | 'Bills' | 'Education' | 'Other';
export type IncomeCategory = 'Salary' | 'Freelance' | 'Business' | 'Investment' | 'Gift' | 'Refund' | 'Other Income';
export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  name: string;
  category: Category;
  amount: number;
  date: string;
  type: TransactionType;
}

export interface Budget {
  category: ExpenseCategory;
  limit: number;
}

export interface Currency {
  name: string;
  symbol: string;
  code: string;
  flag: string;
}

export interface ExchangeRates {
  rates: Record<string, number>;
  lastUpdated: number;
  isOffline?: boolean;
}

export interface AppData {
  userName: string;
  transactions: Transaction[];
  budgets: Record<ExpenseCategory, number>;
  history: {
    income: number[];
    expense: number[];
  };
  savingsGoal: number;
  currency: Currency;
  initialBalance: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'error' | 'warning';
}
