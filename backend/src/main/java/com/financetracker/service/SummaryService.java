package com.financetracker.service;

import com.financetracker.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Computes dashboard summary statistics. Pure Java port of the logic
 * that was previously spread across React useMemo hooks in App.tsx.
 */
@Service
public class SummaryService {

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final AppSettingsService settingsService;
    private final InsightService insightService;

    public SummaryService(TransactionService transactionService,
                          BudgetService budgetService,
                          AppSettingsService settingsService,
                          InsightService insightService) {
        this.transactionService = transactionService;
        this.budgetService = budgetService;
        this.settingsService = settingsService;
        this.insightService = insightService;
    }

    public Summary compute() {
        List<Transaction> transactions = transactionService.getAll();
        Map<String, Double> budgets = budgetService.getAll();
        AppSettings settings = settingsService.get();

        double totalSpent = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Expense)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Income)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double initialBalance = settings.getInitialBalance();
        double netBalance = initialBalance + totalIncome - totalSpent;

        int savingsRate = totalIncome > 0
                ? (int) Math.round((netBalance / totalIncome) * 100)
                : 0;

        LocalDate now = LocalDate.now();
        int currentDay = now.getDayOfMonth();
        int daysInMonth = now.lengthOfMonth();
        double dailyAvg = Math.round((double) totalSpent / Math.max(currentDay, 1));
        double projectedExpense = dailyAvg * daysInMonth;
        double projectedSavings = totalIncome - projectedExpense;

        double savingsGoal = settings.getSavingsGoal();
        int savingsGoalProgress = savingsGoal > 0
                ? (int) Math.min(Math.round((netBalance / savingsGoal) * 100), 100)
                : 0;
        savingsGoalProgress = Math.max(0, savingsGoalProgress);

        Map<String, Double> categoryTotals = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Expense)
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)));

        String topCategory = categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("---");

        List<Insight> insights = insightService.generateInsights(
                transactions, budgets, savingsGoal, initialBalance);

        Summary summary = new Summary();
        summary.setTotalIncome(totalIncome);
        summary.setTotalSpent(totalSpent);
        summary.setNetBalance(netBalance);
        summary.setSavingsRate(savingsRate);
        summary.setDailyAvg(dailyAvg);
        summary.setProjectedExpense(projectedExpense);
        summary.setProjectedSavings(projectedSavings);
        summary.setSavingsGoalProgress(savingsGoalProgress);
        summary.setTopCategory(topCategory);
        summary.setCategoryTotals(categoryTotals);
        summary.setInsights(insights);
        return summary;
    }
}
