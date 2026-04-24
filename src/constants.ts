import { Category, ExpenseCategory, IncomeCategory, Transaction, TransactionType, Currency } from './types';

export const CURRENCIES: Currency[] = [
  { name: 'Indian Rupee', symbol: '₹', code: 'INR', flag: '🇮🇳' },
  { name: 'US Dollar', symbol: '$', code: 'USD', flag: '🇺🇸' },
  { name: 'Euro', symbol: '€', code: 'EUR', flag: '🇪🇺' },
  { name: 'British Pound', symbol: '£', code: 'GBP', flag: '🇬🇧' },
  { name: 'Japanese Yen', symbol: '¥', code: 'JPY', flag: '🇯🇵' },
  { name: 'UAE Dirham', symbol: 'د.إ', code: 'AED', flag: '🇦🇪' },
  { name: 'Canadian Dollar', symbol: 'CA$', code: 'CAD', flag: '🇨🇦' },
  { name: 'Australian Dollar', symbol: 'A$', code: 'AUD', flag: '🇦🇺' },
  { name: 'Swiss Franc', symbol: 'Fr', code: 'CHF', flag: '🇨🇭' },
  { name: 'Chinese Yuan', symbol: '¥', code: 'CNY', flag: '🇨🇳' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export const BUDGETS: Record<ExpenseCategory, number> = {
  'Food': 8000,
  'Transport': 3000,
  'Shopping': 5000,
  'Health': 2000,
  'Entertainment': 2500,
  'Bills': 6000,
  'Education': 3000,
  'Other': 2000
};

export const CATEGORY_CONFIG: Record<Category, { icon: string; color: string }> = {
  'Food': { icon: 'Utensils', color: 'text-primary' },
  'Transport': { icon: 'Car', color: 'text-secondary' },
  'Shopping': { icon: 'ShoppingBag', color: 'text-primary-dim' },
  'Health': { icon: 'Activity', color: 'text-tertiary' },
  'Entertainment': { icon: 'Film', color: 'text-secondary-fixed' },
  'Bills': { icon: 'CreditCard', color: 'text-primary' },
  'Education': { icon: 'GraduationCap', color: 'text-primary-container' },
  'Other': { icon: 'LayoutGrid', color: 'text-outline' },
  'Salary': { icon: 'Wallet', color: 'text-primary' },
  'Freelance': { icon: 'Briefcase', color: 'text-secondary' },
  'Business': { icon: 'TrendingUp', color: 'text-primary-dim' },
  'Investment': { icon: 'BarChart3', color: 'text-tertiary' },
  'Gift': { icon: 'Gift', color: 'text-secondary-fixed' },
  'Refund': { icon: 'RotateCcw', color: 'text-primary' },
  'Other Income': { icon: 'PlusCircle', color: 'text-outline' }
};

export const STORAGE_KEY = 'monarch_local_data';
export const RATES_STORAGE_KEY = 'monarch_exchange_rates';

export const FALLBACK_RATES: Record<string, number> = {
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0096,
  JPY: 1.78,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.019,
  CHF: 0.011,
  CNY: 0.087,
  INR: 1.0
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't001', name: 'Monthly Salary', category: 'Salary', amount: 55000, date: '2026-04-01', type: 'Income' },
  { id: 't002', name: 'Grocery Shopping', category: 'Food', amount: 2400, date: '2026-04-02', type: 'Expense' },
  { id: 't003', name: 'Electricity Bill', category: 'Bills', amount: 1800, date: '2026-04-03', type: 'Expense' },
  { id: 't004', name: 'Uber Ride', category: 'Transport', amount: 350, date: '2026-04-04', type: 'Expense' },
  { id: 't005', name: 'Netflix Subscription', category: 'Entertainment', amount: 649, date: '2026-04-05', type: 'Expense' },
  { id: 't006', name: 'Freelance Project', category: 'Freelance', amount: 12000, date: '2026-04-06', type: 'Income' },
  { id: 't007', name: 'Restaurant Dinner', category: 'Food', amount: 1850, date: '2026-04-07', type: 'Expense' },
  { id: 't008', name: 'Online Course', category: 'Education', amount: 2999, date: '2026-04-08', type: 'Expense' },
  { id: 't009', name: 'Pharmacy', category: 'Health', amount: 780, date: '2026-04-09', type: 'Expense' },
  { id: 't010', name: 'Amazon Shopping', category: 'Shopping', amount: 3200, date: '2026-04-10', type: 'Expense' },
  { id: 't011', name: 'Internet Bill', category: 'Bills', amount: 999, date: '2026-04-11', type: 'Expense' },
  { id: 't012', name: 'Metro Card Recharge', category: 'Transport', amount: 500, date: '2026-04-12', type: 'Expense' },
  { id: 't013', name: 'Birthday Gift Received', category: 'Gift', amount: 3000, date: '2026-04-13', type: 'Income' },
  { id: 't014', name: 'Coffee & Snacks', category: 'Food', amount: 620, date: '2026-04-14', type: 'Expense' },
  { id: 't015', name: 'Gym Membership', category: 'Health', amount: 1500, date: '2026-04-15', type: 'Expense' },
  { id: 't016', name: 'Clothing Store', category: 'Shopping', amount: 2750, date: '2026-04-16', type: 'Expense' },
  { id: 't017', name: 'Movie Tickets', category: 'Entertainment', amount: 900, date: '2026-04-17', type: 'Expense' },
  { id: 't018', name: 'Dividend Income', category: 'Investment', amount: 4500, date: '2026-04-18', type: 'Income' },
  { id: 't019', name: 'Petrol', category: 'Transport', amount: 2200, date: '2026-04-19', type: 'Expense' },
  { id: 't020', name: 'Water Bill', category: 'Bills', amount: 450, date: '2026-04-20', type: 'Expense' },
  { id: 't021', name: 'Swiggy Order', category: 'Food', amount: 480, date: '2026-04-21', type: 'Expense' },
  { id: 't022', name: 'Book Purchase', category: 'Education', amount: 850, date: '2026-04-22', type: 'Expense' },
  { id: 't023', name: 'Tax Refund', category: 'Refund', amount: 5200, date: '2026-04-23', type: 'Income' },
  { id: 't024', name: 'Spotify Premium', category: 'Entertainment', amount: 119, date: '2026-04-23', type: 'Expense' },
];

export const DEFAULT_HISTORY = {
  income: [45000, 47500, 52000, 49000, 53000, 58000],
  expense: [32000, 36500, 29000, 41000, 38500, 43000]
};
