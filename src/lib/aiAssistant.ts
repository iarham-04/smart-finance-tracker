import { ExpenseCategory, Transaction } from '../types';

export interface FinanceSnapshot {
  totalIncome: number;
  totalSpent: number;
  netBalance: number;
  savingsGoal: number;
  savingsProgress: number;
  topExpenseCategory: ExpenseCategory | null;
  topExpenseAmount: number;
  riskiestBudgetCategory: ExpenseCategory | null;
  riskiestBudgetUsage: number;
}

export interface AssistantMemory {
  focusCategory: ExpenseCategory | null;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Bills', 'Education', 'Other'];

export const createFinanceSnapshot = (
  transactions: Transaction[],
  budgets: Record<ExpenseCategory, number>,
  savingsGoalRaw: number,
  initialBalance: number,
  currencyCode: string,
  convert: (amount: number, code: string) => number
): FinanceSnapshot => {
  const totalSpentRaw = transactions.filter((t) => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
  const totalIncomeRaw = transactions.filter((t) => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const netBalanceRaw = initialBalance + totalIncomeRaw - totalSpentRaw;

  const expenseTotals = EXPENSE_CATEGORIES.reduce<Record<ExpenseCategory, number>>((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  transactions.forEach((transaction) => {
    if (transaction.type === 'Expense' && EXPENSE_CATEGORIES.includes(transaction.category as ExpenseCategory)) {
      const category = transaction.category as ExpenseCategory;
      expenseTotals[category] += transaction.amount;
    }
  });

  let topExpenseCategoryCandidate = EXPENSE_CATEGORIES[0];
  let topExpenseAmountRaw = expenseTotals[topExpenseCategoryCandidate];
  EXPENSE_CATEGORIES.forEach((category) => {
    if (expenseTotals[category] > topExpenseAmountRaw) {
      topExpenseCategoryCandidate = category;
      topExpenseAmountRaw = expenseTotals[category];
    }
  });
  const topExpenseCategory = topExpenseAmountRaw > 0 ? topExpenseCategoryCandidate : null;

  const validBudgetCategories = EXPENSE_CATEGORIES.filter((category) => budgets[category] > 0);
  let riskiestBudgetCategory: ExpenseCategory | null = null;
  let maxBudgetUsage = 0;

  validBudgetCategories.forEach((category) => {
    const usage = expenseTotals[category] / budgets[category];
    if (usage > maxBudgetUsage) {
      maxBudgetUsage = usage;
      riskiestBudgetCategory = category;
    }
  });

  const riskiestBudgetUsage =
    riskiestBudgetCategory && budgets[riskiestBudgetCategory] > 0
      ? (expenseTotals[riskiestBudgetCategory] / budgets[riskiestBudgetCategory]) * 100
      : 0;

  return {
    totalIncome: convert(totalIncomeRaw, currencyCode),
    totalSpent: convert(totalSpentRaw, currencyCode),
    netBalance: convert(netBalanceRaw, currencyCode),
    savingsGoal: convert(savingsGoalRaw, currencyCode),
    savingsProgress: savingsGoalRaw > 0 ? Math.max(0, Math.round((netBalanceRaw / savingsGoalRaw) * 100)) : 0,
    topExpenseCategory,
    topExpenseAmount: convert(topExpenseAmountRaw, currencyCode),
    riskiestBudgetCategory,
    riskiestBudgetUsage: Math.round(riskiestBudgetUsage),
  };
};

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  Food: ['food', 'dining', 'restaurant', 'groceries'],
  Transport: ['transport', 'travel', 'fuel', 'cab'],
  Shopping: ['shopping', 'purchase', 'buy'],
  Health: ['health', 'medical', 'medicine', 'doctor'],
  Entertainment: ['entertainment', 'fun', 'movie', 'games'],
  Bills: ['bills', 'rent', 'utilities', 'electricity'],
  Education: ['education', 'course', 'study', 'learning'],
  Other: ['other', 'misc'],
};

const detectCategoryFromMessage = (message: string): ExpenseCategory | null => {
  const text = message.toLowerCase();
  for (const category of EXPENSE_CATEGORIES) {
    if (CATEGORY_KEYWORDS[category].some((keyword) => text.includes(keyword))) {
      return category;
    }
  }
  return null;
};

export const generateAssistantReply = (
  message: string,
  snapshot: FinanceSnapshot,
  memory: AssistantMemory,
  currencySymbol: string
): { text: string; memory: AssistantMemory } => {
  const lowerMessage = message.toLowerCase();
  const detectedCategory = detectCategoryFromMessage(message);
  const nextMemory: AssistantMemory = {
    ...memory,
    focusCategory: detectedCategory || memory.focusCategory || null,
  };
  const budgetTargetLabel = snapshot.riskiestBudgetCategory ?? 'your key budget category';

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      memory: nextMemory,
      text: `Hi! I can help with spending analysis, budget planning, and savings workflows. Your net balance is ${currencySymbol}${snapshot.netBalance.toLocaleString()}.`,
    };
  }

  if (lowerMessage.includes('plan') || lowerMessage.includes('workflow') || lowerMessage.includes('improve')) {
    return {
      memory: nextMemory,
      text:
        `Here is a 3-step workflow:\n` +
        `1) Review: Income ${currencySymbol}${snapshot.totalIncome.toLocaleString()} vs spending ${currencySymbol}${snapshot.totalSpent.toLocaleString()}.\n` +
        `2) Prioritize: ${snapshot.topExpenseCategory ? `${snapshot.topExpenseCategory} is your top expense (${currencySymbol}${snapshot.topExpenseAmount.toLocaleString()}).` : 'Add a few transactions to detect your top expense category.'}\n` +
        `3) Execute: Keep ${budgetTargetLabel} below 80% of budget (currently ${snapshot.riskiestBudgetUsage}%) and push savings progress from ${snapshot.savingsProgress}% to 100%.`,
    };
  }

  if (lowerMessage.includes('budget')) {
    return {
      memory: nextMemory,
      text:
        `${budgetTargetLabel} is the highest-risk budget at ${snapshot.riskiestBudgetUsage}% usage. ` +
        `${snapshot.riskiestBudgetUsage >= 90 ? 'Pause optional expenses in this category for a few days.' : 'You still have room, but track it closely this week.'}`,
    };
  }

  if (lowerMessage.includes('save') || lowerMessage.includes('goal')) {
    const gap = Math.max(snapshot.savingsGoal - snapshot.netBalance, 0);
    return {
      memory: nextMemory,
      text:
        `Savings goal progress: ${snapshot.savingsProgress}%. ` +
        `${gap > 0 ? `You are ${currencySymbol}${gap.toLocaleString()} away from your goal.` : 'You have already reached your savings goal. Great work!'} ` +
        `Try a weekly transfer habit to stay consistent.`,
    };
  }

  const focusText = nextMemory.focusCategory ? `You mentioned ${nextMemory.focusCategory}. ` : '';
  return {
    memory: nextMemory,
    text:
      `${focusText}Current summary: Income ${currencySymbol}${snapshot.totalIncome.toLocaleString()}, spending ${currencySymbol}${snapshot.totalSpent.toLocaleString()}, net ${currencySymbol}${snapshot.netBalance.toLocaleString()}. ` +
      `Ask me for a budget check, savings plan, or a multi-step workflow.`,
  };
};
