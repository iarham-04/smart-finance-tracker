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

export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_HISTORY = {
  income: [0, 0, 0, 0, 0, 0],
  expense: [0, 0, 0, 0, 0, 0]
};
