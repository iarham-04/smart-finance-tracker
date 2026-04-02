import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  User, 
  Calendar, 
  TrendingUp, 
  Utensils, 
  Receipt,
  Plus,
  Search,
  Grid2X2,
  Car,
  ShoppingBag,
  X,
  Activity,
  Film,
  CreditCard,
  GraduationCap,
  LayoutGrid,
  Edit3,
  Info,
  TriangleAlert,
  Briefcase,
  Gift,
  RotateCcw,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  TrendingDown,
  BriefcaseBusiness,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  subDays, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  addMonths, 
  subMonths,
  isSameMonth,
  getDay
} from 'date-fns';
import { cn } from './lib/utils';
import { Transaction, Category, AppData, TransactionType, ExpenseCategory, IncomeCategory, Insight, Currency, ExchangeRates } from './types';
import { BUDGETS, CATEGORY_CONFIG, STORAGE_KEY, DEFAULT_TRANSACTIONS, DEFAULT_HISTORY, CURRENCIES, DEFAULT_CURRENCY, RATES_STORAGE_KEY, FALLBACK_RATES } from './constants';

// --- Components ---

const TopAppBar = ({ 
  subTitle, 
  theme, 
  toggleTheme, 
  onCalendarClick,
  currency,
  onCurrencyChange,
  exchangeRates,
  loadingRates,
  onRefreshRates
}: { 
  subTitle: string; 
  theme: 'light' | 'dark'; 
  toggleTheme: () => void; 
  onCalendarClick: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  exchangeRates: ExchangeRates | null;
  loadingRates: boolean;
  onRefreshRates: () => void;
}) => {
  const lastUpdatedText = useMemo(() => {
    if (!exchangeRates) return '';
    const mins = Math.floor((Date.now() - exchangeRates.lastUpdated) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return '1d+ ago';
  }, [exchangeRates]);

  return (
    <header className="bg-surface-container-low sticky top-0 z-50 transition-all border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden bg-surface-container flex items-center justify-center">
            <Wallet className="text-primary w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-label text-on-surface-variant tracking-wider uppercase">{subTitle}</span>
            <h1 className="font-headline font-bold tracking-tight text-on-surface text-lg">mOnarch</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end mr-1">
            <div className="relative group">
              <select 
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find(c => c.code === e.target.value);
                  if (selected) onCurrencyChange(selected);
                }}
                className="appearance-none bg-surface-container-high text-on-surface text-[10px] font-bold py-1.5 pl-2.5 pr-7 rounded-full border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                {loadingRates ? (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </div>
            </div>
            {exchangeRates && (
              <div className="flex items-center gap-1 mt-0.5 px-1">
                <span className={cn(
                  "text-[8px] font-medium",
                  exchangeRates.isOffline ? "text-tertiary" : "text-on-surface-variant"
                )}>
                  {exchangeRates.isOffline ? 'Offline rates' : `Rates: ${lastUpdatedText}`}
                </span>
                {exchangeRates.isOffline && (
                  <button onClick={onRefreshRates} className="text-primary hover:underline text-[8px] font-bold">
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onCalendarClick}
            className="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const BottomNavBar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-xl rounded-t-[1.5rem] shadow-[0_-8px_24px_rgba(0,0,0,0.4)] border-t border-outline-variant/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 active:scale-90",
            activeTab === tab.id ? "text-primary bg-surface-container-high rounded-xl" : "text-outline"
          )}
        >
          <tab.icon className={cn("w-6 h-6", activeTab === tab.id && "fill-current")} />
          <span className="font-body text-[10px] font-medium tracking-wide mt-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Views ---

const DashboardView = ({ transactions, history, budgets, savingsGoal, onSetGoal, currency, initialBalance, onAdjustBalance, convert }: { transactions: Transaction[]; history: { income: number[]; expense: number[] }; budgets: Record<ExpenseCategory, number>; savingsGoal: number; onSetGoal: () => void; currency: Currency; initialBalance: number; onAdjustBalance: () => void; convert: (amount: number, code: string) => number }) => {
  const [pieTab, setPieTab] = useState<TransactionType>('Expense');
  
  const totalSpent = useMemo(() => transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const netBalance = initialBalance + totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;
  
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const dailyAvg = Math.round(totalSpent / Math.max(currentDay, 1));
  
  // Projection
  const projectedExpense = dailyAvg * daysInMonth;
  const projectedSavings = totalIncome - projectedExpense;
  const savingsGoalProgress = Math.max(0, Math.min(Math.round((netBalance / (savingsGoal || 1)) * 100), 100));

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === pieTab) {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }
    });
    return totals;
  }, [transactions, pieTab]);

  const expenseTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.filter(t => t.type === 'Expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
  }, [transactions]);

  const topCategory = useMemo(() => {
    const entries = Object.entries(expenseTotals);
    if (entries.length === 0) return '---';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, [expenseTotals]);

  const totalBudget = useMemo(() => Object.values(budgets).reduce((a, b) => a + b, 0), [budgets]);
  const progressPercent = Math.min(Math.round((totalSpent / (totalBudget || 1)) * 100), 100);

  const chartData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    return months.map((m, i) => ({ 
      name: m, 
      income: convert(history?.income?.[i] || 0, currency.code),
      expense: convert(history?.expense?.[i] || 0, currency.code)
    }));
  }, [history, currency.code, convert]);

  const pieData = useMemo(() => {
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [categoryTotals]);

  const COLORS = ['#60fcc6', '#19ce9b', '#fcaf00', '#ff716c', '#4eeeb9', '#ff928c', '#eba300', '#1c2826'];

  const insights = useMemo(() => {
    const list: Insight[] = [];

    // Budget Alerts
    (Object.entries(expenseTotals) as [string, number][]).forEach(([cat, spent]) => {
      const limit = budgets[cat as ExpenseCategory] || 0;
      const perc = (spent / (limit || 1)) * 100;
      if (perc > 85) {
        list.push({
          id: `budget-${cat}`,
          title: `Budget Alert: ${cat}`,
          description: `You've reached ${Math.round(perc)}% of your ${cat} budget. Spend carefully!`,
          icon: 'TriangleAlert',
          color: 'error'
        });
      }
    });

    // Negative Balance
    if (netBalance < 0) {
      list.push({
        id: 'negative-balance',
        title: 'Negative Balance',
        description: `Your expenses (${currency.symbol}${convert(totalSpent, currency.code).toLocaleString()}) exceed your income (${currency.symbol}${convert(totalIncome, currency.code).toLocaleString()}).`,
        icon: 'TrendingDown',
        color: 'error'
      });
    }

    // Savings Goal Progress
    if (savingsGoal > 0) {
      if (savingsGoalProgress >= 100) {
        list.push({
          id: 'goal-reached',
          title: 'Goal Reached!',
          description: `Congratulations! You've reached your monthly savings goal of ${currency.symbol}${convert(savingsGoal, currency.code).toLocaleString()}.`,
          icon: 'TrendingUp',
          color: 'primary'
        });
      } else if (savingsGoalProgress > 50) {
        list.push({
          id: 'goal-on-track',
          title: 'On Track!',
          description: `You're ${savingsGoalProgress}% of the way to your savings goal. Keep going!`,
          icon: 'TrendingUp',
          color: 'secondary'
        });
      }
    }

    // Top Category
    if (topCategory !== '---' && expenseTotals[topCategory] > totalSpent * 0.4) {
      list.push({
        id: 'top-category',
        title: 'High Spending',
        description: `${topCategory} accounts for ${Math.round((expenseTotals[topCategory] / totalSpent) * 100)}% of your total spending.`,
        icon: 'Info',
        color: 'warning'
      });
    }

    // Daily Average
    if (dailyAvg > (totalBudget / daysInMonth) * 1.2) {
      list.push({
        id: 'daily-avg',
        title: 'High Daily Spend',
        description: `Your daily average (${currency.symbol}${convert(dailyAvg, currency.code).toLocaleString()}) is higher than your daily budget (${currency.symbol}${convert(Math.round(totalBudget / daysInMonth), currency.code).toLocaleString()}).`,
        icon: 'TrendingDown',
        color: 'warning'
      });
    }

    // Savings Rate
    if (totalIncome > 0) {
      if (savingsRate >= 30) {
        list.push({
          id: 'savings-rate-high',
          title: 'Excellent Saving!',
          description: `You've saved ${savingsRate}% of your income this month. Keep it up!`,
          icon: 'TrendingUp',
          color: 'primary'
        });
      } else if (savingsRate < 10 && savingsRate >= 0) {
        list.push({
          id: 'savings-rate-low',
          title: 'Low Savings Rate',
          description: `Try to save at least 20% of your income. Your current rate is ${savingsRate}%.`,
          icon: 'Info',
          color: 'warning'
        });
      }
    }

    return list;
  }, [expenseTotals, budgets, netBalance, totalSpent, totalIncome, savingsGoal, savingsGoalProgress, topCategory, dailyAvg, totalBudget, daysInMonth, savingsRate, currency]);

  const INSIGHT_ICONS: Record<string, React.ElementType> = {
    TriangleAlert, TrendingDown, TrendingUp, Info
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Hero Balance Section */}
      <section className="mt-4">
        <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-surface-container-high to-surface-container-low group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-on-surface-variant font-label text-sm tracking-widest uppercase">Net Balance</p>
            <button 
              onClick={onAdjustBalance}
              className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
              title="Adjust Balance"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-2xl font-headline font-bold", netBalance >= 0 ? "text-primary" : "text-error")}>{currency.symbol}</span>
            <span className={cn("text-5xl font-headline font-extrabold tracking-tighter", netBalance >= 0 ? "text-on-surface" : "text-error")}>
              {convert(netBalance, currency.code).toLocaleString()}
            </span>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{currency.symbol}{convert(totalIncome, currency.code).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-error">
              <ArrowDownCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{currency.symbol}{convert(totalSpent, currency.code).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={onSetGoal}
          className="p-5 rounded-2xl bg-surface-container-high space-y-3 relative overflow-hidden group text-left"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <TrendingUp className="text-primary w-6 h-6" />
          <div>
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">Savings Goal</p>
            <div className="flex items-end gap-2">
              <p className="text-lg font-bold font-headline text-on-surface">
                {savingsGoal > 0 ? `${savingsGoalProgress}%` : 'Set Goal'}
              </p>
              {savingsGoal > 0 && (
                <span className="text-[10px] text-on-surface-variant mb-1">of {currency.symbol}{convert(savingsGoal, currency.code).toLocaleString()}</span>
              )}
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${savingsGoalProgress}%` }} />
            </div>
          </div>
        </button>
        <div className="p-5 rounded-2xl bg-surface-container-high space-y-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <BarChart3 className="text-secondary w-6 h-6" />
          <div>
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">Projection</p>
            <p className={cn("text-lg font-bold font-headline", projectedSavings >= savingsGoal ? "text-primary" : "text-error")}>
              {currency.symbol}{convert(projectedSavings, currency.code).toLocaleString()}
            </p>
            <p className="text-[10px] text-on-surface-variant">Est. month end</p>
          </div>
        </div>
        <div className="col-span-2 p-5 rounded-2xl bg-surface-container-high flex justify-between items-center">
          <div>
            <p className="text-on-surface-variant text-xs font-label uppercase tracking-widest">Daily Avg Expense</p>
            <p className="text-on-surface text-xl font-bold font-headline">{currency.symbol}{convert(dailyAvg, currency.code).toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                className="text-primary transition-all duration-500" 
                cx="32" cy="32" r="28" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="4"
                strokeDasharray={175}
                strokeDashoffset={175 - (175 * progressPercent) / 100}
              />
            </svg>
            <span className="text-[10px] font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>
      </section>

      {/* Spending Trend */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="font-headline font-bold text-xl ml-2">Cash Flow</h3>
          <span className="text-primary text-xs font-label">Last 6 Months</span>
        </div>
        <div className="p-6 rounded-[2rem] bg-surface-container-low h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#172220', border: 'none', borderRadius: '12px', color: '#dfe7e5' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: number) => [`${currency.symbol}${value.toLocaleString()}`, '']}
              />
              <Line type="monotone" dataKey="income" stroke="#60fcc6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="expense" stroke="#ff716c" strokeWidth={3} dot={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Income vs Expense Bar Chart */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-xl ml-2">Income vs Expense</h3>
        <div className="p-6 rounded-[2rem] bg-surface-container-low h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#172220', border: 'none', borderRadius: '12px', color: '#dfe7e5' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: number) => [`${currency.symbol}${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="income" fill="#60fcc6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ff716c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Allocation */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-headline font-bold text-xl">Allocation</h3>
          <div className="flex bg-surface-container-high rounded-lg p-1">
            <button 
              onClick={() => setPieTab('Expense')}
              className={cn("px-3 py-1 text-xs font-label rounded-md transition-all", pieTab === 'Expense' ? "bg-primary text-on-primary" : "text-on-surface-variant")}
            >
              Expense
            </button>
            <button 
              onClick={() => setPieTab('Income')}
              className={cn("px-3 py-1 text-xs font-label rounded-md transition-all", pieTab === 'Income' ? "bg-primary text-on-primary" : "text-on-surface-variant")}
            >
              Income
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-6 items-center p-6 rounded-[2rem] bg-surface-container-low">
          <div className="col-span-2 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-3 space-y-3">
            {pieData.length > 0 ? pieData.map((entry, index) => {
              const total = pieTab === 'Expense' ? totalSpent : totalIncome;
              return (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs text-on-surface-variant truncate max-w-[80px]">{entry.name}</span>
                  </div>
                  <span className="text-xs font-bold">{total > 0 ? Math.round((entry.value / total) * 100) : 0}%</span>
                </div>
              );
            }) : (
              <p className="text-xs text-on-surface-variant text-center py-4">No data for this type</p>
            )}
          </div>
        </div>
      </section>

      {/* Smart Insights */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-xl ml-2">Smart Insights</h3>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = INSIGHT_ICONS[insight.icon] || Info;
            return (
              <motion.div 
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "group relative overflow-hidden p-5 rounded-2xl bg-surface-container-highest border-l-4",
                  insight.color === 'error' && "border-error",
                  insight.color === 'primary' && "border-primary",
                  insight.color === 'secondary' && "border-secondary",
                  insight.color === 'warning' && "border-warning"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    insight.color === 'error' && "bg-error/10 text-error",
                    insight.color === 'primary' && "bg-primary/10 text-primary",
                    insight.color === 'secondary' && "bg-secondary/10 text-secondary",
                    insight.color === 'warning' && "bg-warning/10 text-warning"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{insight.title}</h4>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {insights.length === 0 && (
            <div className="p-8 text-center bg-surface-container-highest/30 rounded-2xl border border-dashed border-outline-variant/20">
              <Info className="w-8 h-8 mx-auto mb-2 text-on-surface-variant opacity-20" />
              <p className="text-sm text-on-surface-variant italic">No new insights. You're doing great!</p>
            </div>
          )}

          <div className="group relative overflow-hidden p-5 rounded-2xl bg-surface-container-highest border-l-4 border-primary">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Offline Mode</h4>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">Your data is stored securely in your browser's local storage. No account required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const ExpensesView = ({ transactions, onDelete, currency, convert }: { transactions: Transaction[]; onDelete: (id: string) => void; currency: Currency; convert: (amount: number, code: string) => number }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, activeCategory]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const expenseCategories: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
  const incomeCategories: IncomeCategory[] = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other Income'];
  const allCategories: (Category | 'All')[] = ['All', ...expenseCategories, ...incomeCategories];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Search */}
      <section className="mt-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-on-surface-variant w-5 h-5" />
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 transition-all font-body"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Chips */}
      <section className="overflow-x-auto flex gap-3 no-scrollbar pb-2">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-label text-sm transition-colors",
              activeCategory === cat 
                ? "bg-primary-container/20 text-primary border border-primary/20" 
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
            )}
          >
            {cat === 'All' ? <Grid2X2 className="w-4 h-4" /> : null}
            {cat}
          </button>
        ))}
      </section>

      {/* List */}
      <div className="space-y-8">
        {groupedTransactions.map(([date, items]) => {
          const today = format(new Date(), 'yyyy-MM-dd');
          const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
          const label = date === today ? 'Today' : (date === yesterday ? 'Yesterday' : format(parseISO(date), 'MMM d'));
          const subLabel = date === today || date === yesterday ? format(parseISO(date), 'MMM d') : '';

          return (
            <section key={date}>
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">{label}</h2>
                <span className="font-label text-xs font-medium text-outline-variant tracking-wider uppercase">{subLabel}</span>
              </div>
              <div className="space-y-2">
                {items.map(item => {
                  const config = CATEGORY_CONFIG[item.category];
                  return (
                    <div key={item.id} className="bg-surface-container-high/60 backdrop-blur-xl flex items-center justify-between p-4 rounded-xl group transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center", config.color)}>
                          {/* Dynamic Icon Rendering */}
                          {item.category === 'Food' && <Utensils className="w-6 h-6" />}
                          {item.category === 'Transport' && <Car className="w-6 h-6" />}
                          {item.category === 'Shopping' && <ShoppingBag className="w-6 h-6" />}
                          {item.category === 'Health' && <Activity className="w-6 h-6" />}
                          {item.category === 'Entertainment' && <Film className="w-6 h-6" />}
                          {item.category === 'Bills' && <CreditCard className="w-6 h-6" />}
                          {item.category === 'Education' && <GraduationCap className="w-6 h-6" />}
                          {item.category === 'Other' && <LayoutGrid className="w-6 h-6" />}
                          {item.category === 'Salary' && <Wallet className="w-6 h-6" />}
                          {item.category === 'Freelance' && <Briefcase className="w-6 h-6" />}
                          {item.category === 'Business' && <TrendingUp className="w-6 h-6" />}
                          {item.category === 'Investment' && <BarChart3 className="w-6 h-6" />}
                          {item.category === 'Gift' && <Gift className="w-6 h-6" />}
                          {item.category === 'Refund' && <RotateCcw className="w-6 h-6" />}
                          {item.category === 'Other Income' && <PlusCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-body font-semibold text-on-surface">{item.name}</p>
                          <p className="font-label text-xs text-on-surface-variant">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={cn("font-headline font-bold", item.type === 'Income' ? "text-primary" : "text-error")}>
                          {item.type === 'Income' ? '+' : '-'}{currency.symbol}{convert(item.amount, currency.code).toLocaleString()}
                        </p>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {filteredTransactions.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center opacity-30 select-none">
            <ReceiptText className="w-16 h-16 mb-4" />
            <p className="font-label text-sm text-center">No transactions found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils, Car, ShoppingBag, Activity, Film, CreditCard, GraduationCap, LayoutGrid,
  TrendingUp, Briefcase, Gift, RotateCcw, PlusCircle, Wallet, Receipt, ReceiptText
};

const BudgetsView = ({ transactions, budgets, onUpdateBudget, savingsGoal, onOpenSavingsGoalModal, currency, initialBalance, convert }: { transactions: Transaction[]; budgets: Record<ExpenseCategory, number>; onUpdateBudget: (category: ExpenseCategory, amount: number) => void; savingsGoal: number; onOpenSavingsGoalModal: () => void; currency: Currency; initialBalance: number; convert: (amount: number, code: string) => number }) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.filter(t => t.type === 'Expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return totals;
  }, [transactions]);

  const totalSpent = (Object.values(categoryTotals) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = initialBalance + totalIncome - totalSpent;
  const savingsGoalProgress = Math.max(0, Math.min(Math.round((netBalance / (savingsGoal || 1)) * 100), 100));
  
  const totalBudget = (Object.values(budgets) as number[]).reduce((a: number, b: number) => a + b, 0);
  const alertsCount = (Object.entries(categoryTotals) as [string, number][]).filter(([cat, spent]) => (spent / (budgets[cat as ExpenseCategory] || 1)) >= 0.9).length;

  const handleEdit = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    setEditAmount(convert(budgets[cat], currency.code).toString());
  };

  const handleSave = () => {
    if (editingCategory && editAmount) {
      onUpdateBudget(editingCategory, parseFloat(editAmount));
      setEditingCategory(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      {/* Savings Goal Section */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-[2rem] border border-primary/10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg">Monthly Savings Goal</h3>
                <p className="text-xs text-on-surface-variant">Set your target for this month</p>
              </div>
            </div>
            {savingsGoal > 0 ? (
              <button 
                onClick={onOpenSavingsGoalModal}
                className="text-primary font-bold text-sm hover:underline"
              >
                {currency.symbol}{convert(savingsGoal, currency.code).toLocaleString()}
              </button>
            ) : (
              <button 
                onClick={onOpenSavingsGoalModal}
                className="text-primary font-bold text-sm hover:underline"
              >
                Set Goal
              </button>
            )}
          </div>
          <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${savingsGoalProgress}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Daily Spending Bar Chart */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-on-surface-variant font-label text-xs tracking-widest uppercase mb-1">Overview</p>
            <h2 className="font-headline font-extrabold text-3xl tracking-tight">Daily Spending</h2>
          </div>
          <div className="bg-surface-container-high px-3 py-1 rounded-full text-primary font-label text-xs">
            This Month
          </div>
        </div>
        <div className="bg-surface-container-high/60 backdrop-blur-xl p-6 rounded-[2rem] relative overflow-hidden">
          <div className="flex items-end justify-between h-40 gap-1.5">
            {[30, 45, 85, 60, 40, 95, 50, 35, 70, 55, 80].map((h, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 rounded-t-full transition-all duration-500",
                  i === 2 || i === 10 ? "bg-primary shadow-[0_0_15px_rgba(96,252,198,0.3)]" : (i === 5 ? "bg-primary-container shadow-[0_0_20px_rgba(25,206,155,0.4)]" : (i === 8 ? "bg-secondary" : "bg-surface-variant"))
                )}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-label text-outline uppercase tracking-tighter">
            <span>Oct 01</span>
            <span>Oct 15</span>
            <span>Oct 31</span>
          </div>
        </div>
      </section>

      {/* Category Budgets */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6 pl-2">
          <h2 className="font-headline font-bold text-xl">Category Budgets</h2>
        </div>
        <div className="space-y-4">
          {(Object.keys(budgets) as ExpenseCategory[]).map(cat => {
            const limit = budgets[cat];
            const spent = categoryTotals[cat] || 0;
            const percentage = Math.min((spent / limit) * 100, 100);
            const config = CATEGORY_CONFIG[cat];
            const isEditing = editingCategory === cat;

            let colorClass = 'bg-primary';
            let iconBg = 'bg-primary/10';
            let textColor = 'text-primary';

            if (percentage >= 90) {
              colorClass = 'bg-tertiary';
              iconBg = 'bg-tertiary/10';
              textColor = 'text-tertiary';
            } else if (percentage >= 75) {
              colorClass = 'bg-secondary';
              iconBg = 'bg-secondary/10';
              textColor = 'text-secondary';
            }

            return (
              <div key={cat} className="bg-surface-container-high/40 p-4 rounded-3xl border border-outline-variant/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", iconBg)}>
                      {React.createElement(ICON_MAP[config.icon] || LayoutGrid, { className: cn("w-5 h-5", textColor) })}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-sm">{cat}</h3>
                      <p className="text-[10px] text-on-surface-variant font-medium">{currency.symbol}{convert(spent, currency.code).toLocaleString()} of {currency.symbol}{convert(limit, currency.code).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-20 bg-surface-container-highest border border-primary/30 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        <button onClick={handleSave} className="p-1 text-primary hover:bg-primary/10 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(cat)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    )}
                    <span className={cn("font-headline font-bold text-sm", textColor)}>{Math.round(percentage)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", colorClass)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Insights */}
      <section className="mb-8">
        <h3 className="font-headline font-bold text-lg mb-4 pl-2">Quick Insights</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          <div className="min-w-[160px] bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl">
            <TrendingUp className="text-primary w-6 h-6 mb-2" />
            <p className="text-xs text-on-surface-variant mb-1">Projection</p>
            <p className="font-bold">{currency.symbol}{convert(totalBudget - totalSpent, currency.code).toLocaleString()} <span className="text-[10px] font-medium text-primary">Left</span></p>
          </div>
          <div className="min-w-[160px] bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl">
            <Wallet className="text-secondary w-6 h-6 mb-2" />
            <p className="text-xs text-on-surface-variant mb-1">Savings Goal</p>
            <p className="font-bold">{Math.max(0, Math.round(((totalBudget - totalSpent) / (totalBudget || 1)) * 100))}% <span className="text-[10px] font-medium text-secondary">Reached</span></p>
          </div>
          <div className="min-w-[160px] bg-surface-container-low border border-outline-variant/10 p-4 rounded-2xl">
            <TriangleAlert className="text-tertiary w-6 h-6 mb-2" />
            <p className="text-xs text-on-surface-variant mb-1">Alerts</p>
            <p className="font-bold">{alertsCount} <span className="text-[10px] font-medium text-tertiary">Critical</span></p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(() => {
    const saved = localStorage.getItem(RATES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingRates, setLoadingRates] = useState(false);

  const fetchExchangeRates = async () => {
    setLoadingRates(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const newRates: ExchangeRates = {
        rates: data.rates,
        lastUpdated: Date.now(),
        isOffline: false
      };
      setExchangeRates(newRates);
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(newRates));
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      if (!exchangeRates) {
        const fallback: ExchangeRates = {
          rates: FALLBACK_RATES,
          lastUpdated: Date.now(),
          isOffline: true
        };
        setExchangeRates(fallback);
      } else {
        setExchangeRates({ ...exchangeRates, isOffline: true });
      }
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    const shouldFetch = !exchangeRates || (Date.now() - exchangeRates.lastUpdated > 24 * 60 * 60 * 1000);
    if (shouldFetch) {
      fetchExchangeRates();
    }
  }, []);

  const convert = (amount: number, code: string) => {
    const rate = exchangeRates?.rates[code] || FALLBACK_RATES[code] || 1;
    const converted = amount * rate;
    if (code === 'JPY' || code === 'CNY') {
      return Math.round(converted);
    }
    return Number(converted.toFixed(2));
  };

  const unconvert = (amount: number, code: string) => {
    const rate = exchangeRates?.rates[code] || FALLBACK_RATES[code] || 1;
    return amount / rate;
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('Expense');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('monarch_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migration: Add budgets if missing
        if (!parsed.budgets) {
          parsed.budgets = BUDGETS;
        }

        // Migration: Add savingsGoal if missing
        if (parsed.savingsGoal === undefined) {
          parsed.savingsGoal = 5000;
        }

        // Migration: Add currency if missing
        if (!parsed.currency) {
          parsed.currency = DEFAULT_CURRENCY;
        }

        // Migration: Add initialBalance if missing
        if (parsed.initialBalance === undefined) {
          parsed.initialBalance = 0;
        }

        // Migration: If history is an array (legacy), convert to new format
        if (Array.isArray(parsed.history)) {
          return {
            ...parsed,
            history: {
              income: [0, 0, 0, 0, 0, 0],
              expense: parsed.history
            },
            savingsGoal: parsed.savingsGoal || 5000
          };
        }
        // Ensure history object has the required fields
        if (!parsed.history || !parsed.history.income || !parsed.history.expense) {
          return {
            ...parsed,
            history: DEFAULT_HISTORY,
            savingsGoal: parsed.savingsGoal || 5000
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse local data', e);
      }
    }
    return { transactions: DEFAULT_TRANSACTIONS, history: DEFAULT_HISTORY, budgets: BUDGETS, savingsGoal: 5000, currency: DEFAULT_CURRENCY, initialBalance: 0 };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('monarch_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleUpdateBudget = (category: ExpenseCategory, amount: number) => {
    const inrAmount = unconvert(amount, data.currency.code);
    setData(prev => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [category]: inrAmount
      }
    }));
  };

  const handleUpdateSavingsGoal = (amount: number) => {
    const inrAmount = unconvert(amount, data.currency.code);
    setData(prev => ({
      ...prev,
      savingsGoal: inrAmount
    }));
  };

  const handleCurrencyChange = (currency: Currency) => {
    setData(prev => ({
      ...prev,
      currency
    }));
  };

  const handleUpdateInitialBalance = (amount: number) => {
    const inrAmount = unconvert(amount, data.currency.code);
    setData(prev => ({
      ...prev,
      initialBalance: inrAmount
    }));
  };

  const handleResetData = () => {
    setData({
      transactions: DEFAULT_TRANSACTIONS,
      history: DEFAULT_HISTORY,
      budgets: BUDGETS,
      savingsGoal: 5000,
      currency: DEFAULT_CURRENCY,
      initialBalance: 0
    });
    localStorage.removeItem(STORAGE_KEY);
    setIsResetModalOpen(false);
  };

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const enteredAmount = parseFloat(formData.get('amount') as string);
    const inrAmount = unconvert(enteredAmount, data.currency.code);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      amount: inrAmount,
      category: formData.get('category') as Category,
      date: formData.get('date') as string,
      type: transactionType,
    };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
    setIsModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const currentYear = format(new Date(), 'yyyy');

  const expenseCategories: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];
  const incomeCategories: IncomeCategory[] = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other Income'];

  const totalSpent = data.transactions.filter(t => t.type === 'Expense').reduce((acc: number, t) => acc + t.amount, 0);
  const totalIncome = data.transactions.filter(t => t.type === 'Income').reduce((acc: number, t) => acc + t.amount, 0);
  const netBalance = data.initialBalance + totalIncome - totalSpent;

  return (
    <div className="min-h-screen pb-32 transition-colors duration-300">
      <TopAppBar 
        subTitle={`Local Mode • ${currentYear}`} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onCalendarClick={() => setIsCalendarOpen(true)}
        currency={data.currency}
        onCurrencyChange={handleCurrencyChange}
        exchangeRates={exchangeRates}
        loadingRates={loadingRates}
        onRefreshRates={fetchExchangeRates}
      />
      
      <main className="px-6 pt-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <div key="dashboard">
              <DashboardView 
                transactions={data.transactions} 
                history={data.history} 
                budgets={data.budgets} 
                savingsGoal={data.savingsGoal} 
                onSetGoal={() => setIsSavingsGoalModalOpen(true)}
                currency={data.currency}
                initialBalance={data.initialBalance}
                onAdjustBalance={() => setIsBalanceModalOpen(true)}
                convert={convert}
              />
            </div>
          )}
          {activeTab === 'expenses' && (
            <div key="expenses">
              <ExpensesView transactions={data.transactions} onDelete={handleDeleteExpense} currency={data.currency} convert={convert} />
            </div>
          )}
          {activeTab === 'budgets' && (
            <div key="budgets">
              <BudgetsView 
                transactions={data.transactions} 
                budgets={data.budgets} 
                onUpdateBudget={handleUpdateBudget} 
                savingsGoal={data.savingsGoal}
                onOpenSavingsGoalModal={() => setIsSavingsGoalModalOpen(true)}
                currency={data.currency}
                initialBalance={data.initialBalance}
                convert={convert}
              />
            </div>
          )}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-10 space-y-6"
            >
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-primary/20 shadow-xl overflow-hidden">
                  <User className="w-14 h-14 text-primary" />
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-surface shadow-lg">
                  <Plus className="w-4 h-4 text-on-primary" />
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-headline font-extrabold tracking-tight">Arham</h2>
                <p className="text-on-surface-variant font-medium mt-1">mohdarham4652@gmail.com</p>
              </div>

              <div className="w-full space-y-4">
                <div className="bg-surface-container-high/60 backdrop-blur-xl p-6 rounded-[2rem] border border-outline-variant/10 space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <span className="font-headline font-bold">Currency</span>
                    </div>
                    <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg text-sm">{data.currency.name} ({data.currency.symbol})</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      </div>
                      <span className="font-headline font-bold">Theme</span>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className="bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold border border-outline-variant/20 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="font-headline font-bold">Monthly Limit</span>
                    </div>
                    <span className="font-bold">{data.currency.symbol}{convert((Object.values(data.budgets) as number[]).reduce((a: number, b: number) => a + b, 0), data.currency.code).toLocaleString()}</span>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/10">
                    <button 
                      onClick={() => setIsResetModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-error/10 text-error font-bold hover:bg-error/20 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Clear All Data
                    </button>
                    <p className="text-[10px] text-center text-on-surface-variant mt-2 px-4">
                      This will reset your transactions, budgets, and balance to zero.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Reset Data Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Reset Everything?</h2>
                <p className="text-on-surface-variant">
                  This action cannot be undone. All your transactions and settings will be permanently deleted.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleResetData}
                    className="w-full py-4 bg-error text-white rounded-2xl font-headline font-bold shadow-lg shadow-error/20 hover:shadow-error/40 transition-all active:scale-95"
                  >
                    Yes, Clear Everything
                  </button>
                  <button 
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full py-4 bg-surface-container-highest text-on-surface rounded-2xl font-headline font-bold hover:bg-surface-container-low transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button 
        onClick={() => {
          setTransactionType('Expense');
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-[0_12px_32px_rgba(25,206,155,0.3)] flex items-center justify-center text-on-primary-container active:scale-90 transition-transform z-[60]"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-surface-container-high w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-headline font-bold">Add Transaction</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-on-surface-variant">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Type Toggle */}
              <div className="flex bg-surface-container-low rounded-xl p-1 mb-6">
                <button 
                  onClick={() => setTransactionType('Expense')}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-bold transition-all",
                    transactionType === 'Expense' ? "bg-error text-white shadow-lg" : "text-on-surface-variant"
                  )}
                >
                  Expense
                </button>
                <button 
                  onClick={() => setTransactionType('Income')}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-bold transition-all",
                    transactionType === 'Income' ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant"
                  )}
                >
                  Income
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <input 
                  name="name"
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-1 focus:ring-primary/20"
                  placeholder={transactionType === 'Expense' ? "Title (e.g. Starbucks)" : "Source (e.g. Salary)"}
                  required
                />
                <div className="flex gap-4">
                  <input 
                    name="amount"
                    type="number"
                    step="0.01"
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-1 focus:ring-primary/20"
                    placeholder="Amount"
                    required
                  />
                  <select 
                    name="category"
                    className="bg-surface-container-low border-none rounded-xl p-4 text-on-surface-variant focus:ring-1 focus:ring-primary/20"
                  >
                    {(transactionType === 'Expense' ? expenseCategories : incomeCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <input 
                  name="date"
                  type="date"
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-1 focus:ring-primary/20"
                  required
                />
                <button 
                  type="submit"
                  className={cn(
                    "w-full font-bold py-4 rounded-xl mt-4 active:scale-95 transition-transform",
                    transactionType === 'Expense' ? "bg-error text-white" : "bg-primary text-on-primary"
                  )}
                >
                  Save {transactionType}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Balance Modal */}
      <AnimatePresence>
        {isBalanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-headline font-bold text-on-surface">Adjust Balance</h2>
                <button onClick={() => setIsBalanceModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const amount = Number(new FormData(e.currentTarget).get('amount'));
                handleUpdateInitialBalance(amount);
                setIsBalanceModalOpen(false);
              }}>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10">
                    <label className="block text-xs font-label text-on-surface-variant mb-1 uppercase tracking-wider">Starting Balance ({data.currency.symbol})</label>
                    <input 
                      name="amount"
                      type="number" 
                      defaultValue={convert(data.initialBalance, data.currency.code)}
                      autoFocus
                      className="w-full bg-transparent text-3xl font-headline font-bold text-on-surface focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant px-2">
                    This amount will be added to your total income minus total expenses to calculate your net balance.
                  </p>
                  <button type="submit" className="w-full py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                    Save Balance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Savings Goal Modal */}
      <AnimatePresence>
        {isSavingsGoalModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavingsGoalModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-outline-variant/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-extrabold tracking-tight">Set Savings Goal</h3>
                <button onClick={() => setIsSavingsGoalModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-on-surface-variant text-sm">How much would you like to save this month? We'll help you stay on track.</p>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-xl">{data.currency.symbol}</span>
                  <input 
                    type="number"
                    autoFocus
                    defaultValue={data.savingsGoal ? convert(data.savingsGoal, data.currency.code) : ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        if (!isNaN(val)) {
                          handleUpdateSavingsGoal(val);
                          setIsSavingsGoalModalOpen(false);
                        }
                      }
                    }}
                    className="w-full bg-surface-container-low border-none rounded-2xl p-4 pl-10 text-xl font-bold focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter amount"
                    id="savingsGoalInput"
                  />
                </div>

                <div className="flex gap-3">
                  {[2000, 5000, 10000, 20000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => {
                        const input = document.getElementById('savingsGoalInput') as HTMLInputElement;
                        if (input) input.value = convert(amt, data.currency.code).toString();
                      }}
                      className="flex-1 py-2 rounded-xl bg-surface-container-highest text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {data.currency.symbol}{convert(amt, data.currency.code).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  const input = document.getElementById('savingsGoalInput') as HTMLInputElement;
                  const val = parseFloat(input.value);
                  if (!isNaN(val)) {
                    handleUpdateSavingsGoal(val);
                    setIsSavingsGoalModalOpen(false);
                  }
                }}
                className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl mt-8 active:scale-95 transition-transform shadow-lg shadow-primary/20"
              >
                Save Goal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCalendarOpen(false);
                setSelectedCalendarDate(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative z-10 border border-outline-variant/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-headline font-extrabold tracking-tight">Calendar</h3>
                <button onClick={() => {
                  setIsCalendarOpen(false);
                  setSelectedCalendarDate(null);
                }} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setCurrentCalendarMonth(subMonths(currentCalendarMonth, 1))}
                  className="p-2 hover:bg-surface-container-highest rounded-full text-primary"
                >
                  <TrendingDown className="w-5 h-5 rotate-90" />
                </button>
                <h4 className="font-headline font-bold text-lg">{format(currentCalendarMonth, 'MMMM yyyy')}</h4>
                <button 
                  onClick={() => setCurrentCalendarMonth(addMonths(currentCalendarMonth, 1))}
                  className="p-2 hover:bg-surface-container-highest rounded-full text-primary"
                >
                  <TrendingUp className="w-5 h-5 rotate-90" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={`${day}-${i}`} className="text-center text-[10px] font-label text-on-surface-variant py-2">
                    {day}
                  </div>
                ))}
                {(() => {
                  const monthStart = startOfMonth(currentCalendarMonth);
                  const monthEnd = endOfMonth(monthStart);
                  const startDate = startOfWeek(monthStart);
                  const endDate = endOfWeek(monthEnd);
                  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                  return calendarDays.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isSelected = selectedCalendarDate && isSameDay(day, selectedCalendarDate);
                    const dayTransactions = data.transactions.filter(t => isSameDay(parseISO(t.date), day));
                    const hasTransactions = dayTransactions.length > 0;
                    const totalDaySpent = dayTransactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

                    return (
                      <button
                        key={day.toString()}
                        onClick={() => setSelectedCalendarDate(day)}
                        className={cn(
                          "relative h-10 flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all",
                          !isCurrentMonth && "opacity-20",
                          isSelected ? "bg-primary text-on-primary shadow-lg" : "hover:bg-surface-container-highest",
                          hasTransactions && !isSelected && "text-primary font-bold"
                        )}
                      >
                        {format(day, 'd')}
                        {hasTransactions && !isSelected && (
                          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Selected Date Transactions */}
              <AnimatePresence mode="wait">
                {selectedCalendarDate && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-4 pt-4 border-t border-outline-variant/10"
                  >
                    <div className="flex justify-between items-center">
                      <h5 className="font-headline font-bold text-sm">{format(selectedCalendarDate, 'MMMM d, yyyy')}</h5>
                      <span className="text-xs font-label text-on-surface-variant">
                        {data.transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate)).length} Transactions
                      </span>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {data.transactions
                        .filter(t => isSameDay(parseISO(t.date), selectedCalendarDate))
                        .map(t => (
                          <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/5">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", t.type === 'Expense' ? "bg-error/10 text-error" : "bg-primary/10 text-primary")}>
                                {(() => {
                                  const Icon = ICON_MAP[CATEGORY_CONFIG[t.category as ExpenseCategory]?.icon || 'Receipt'];
                                  return <Icon className="w-4 h-4" />;
                                })()}
                              </div>
                              <div>
                                <p className="text-xs font-bold">{t.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{t.category}</p>
                              </div>
                            </div>
                            <span className={cn("text-xs font-bold", t.type === 'Expense' ? "text-error" : "text-primary")}>
                              {t.type === 'Expense' ? '-' : '+'}{data.currency.symbol}{convert(t.amount, data.currency.code).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      {data.transactions.filter(t => isSameDay(parseISO(t.date), selectedCalendarDate)).length === 0 && (
                        <p className="text-center text-xs text-on-surface-variant py-4 italic">No transactions for this day</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedCalendarDate && (
                <div className="space-y-6">
                  <div className="text-center py-8 opacity-40">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-xs font-label uppercase tracking-widest">Select a date to view spending</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsCalendarOpen(false);
                      setIsSummaryOpen(true);
                    }}
                    className="w-full py-4 rounded-2xl bg-surface-container-highest text-primary font-headline font-bold text-sm border border-outline-variant/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Monthly Summary
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Summary Modal */}
      <AnimatePresence>
        {isSummaryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSummaryOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-outline-variant/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-extrabold tracking-tight">Monthly Summary</h3>
                <button onClick={() => setIsSummaryOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="text-primary w-6 h-6" />
                    <span className="font-headline font-bold">Total Income</span>
                  </div>
                  <span className="text-primary font-bold">{data.currency.symbol}{convert(totalIncome, data.currency.code).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-error/10 border border-error/20">
                  <div className="flex items-center gap-3">
                    <ArrowDownCircle className="text-error w-6 h-6" />
                    <span className="font-headline font-bold">Total Expenses</span>
                  </div>
                  <span className="text-error font-bold">{data.currency.symbol}{convert(totalSpent, data.currency.code).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-secondary w-6 h-6" />
                    <span className="font-headline font-bold">Net Savings</span>
                  </div>
                  <span className={cn("font-bold", netBalance >= 0 ? "text-primary" : "text-error")}>
                    {data.currency.symbol}{convert(netBalance, data.currency.code).toLocaleString()}
                  </span>
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Savings Goal Progress</span>
                    <span className="text-xs font-bold text-primary">{Math.min(Math.round((netBalance / (data.savingsGoal || 1)) * 100), 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((netBalance / (data.savingsGoal || 1)) * 100), 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsSummaryOpen(false)}
                className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl mt-8 active:scale-95 transition-transform shadow-lg shadow-primary/20"
              >
                Close Summary
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
