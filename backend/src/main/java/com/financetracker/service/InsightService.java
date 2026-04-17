package com.financetracker.service;

import com.financetracker.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Pure Java port of the insight-generation logic originally in the React App.tsx.
 * All amounts are in the base currency (INR) stored in the DB.
 */
@Service
public class InsightService {

    public List<Insight> generateInsights(
            List<Transaction> transactions,
            Map<String, Double> budgets,
            double savingsGoal,
            double initialBalance) {

        List<Insight> insights = new ArrayList<>();

        // --- Compute aggregates ---
        double totalSpent = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Expense)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Income)
                .mapToDouble(Transaction::getAmount)
                .sum();

        double netBalance = initialBalance + totalIncome - totalSpent;

        int savingsRate = totalIncome > 0
                ? (int) Math.round((netBalance / totalIncome) * 100)
                : 0;

        Map<String, Double> expenseTotals = transactions.stream()
                .filter(t -> t.getType() == TransactionType.Expense)
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)));

        LocalDate now = LocalDate.now();
        int currentDay = now.getDayOfMonth();
        int daysInMonth = now.lengthOfMonth();
        double dailyAvg = totalSpent / Math.max(currentDay, 1);

        double totalBudget = budgets.values().stream().mapToDouble(Double::doubleValue).sum();
        double projectedExpense = dailyAvg * daysInMonth;
        double projectedSavings = totalIncome - projectedExpense;

        int savingsGoalProgress = savingsGoal > 0
                ? (int) Math.min(Math.round((netBalance / savingsGoal) * 100), 100)
                : 0;

        // --- Budget Alerts ---
        expenseTotals.forEach((cat, spent) -> {
            double limit = budgets.getOrDefault(cat, 0.0);
            if (limit > 0) {
                double perc = (spent / limit) * 100;
                if (perc > 85) {
                    insights.add(new Insight(
                            "budget-" + cat,
                            "Budget Alert: " + cat,
                            String.format("You've reached %d%% of your %s budget. Spend carefully!",
                                    (int) Math.round(perc), cat),
                            "TriangleAlert",
                            "error"
                    ));
                }
            }
        });

        // --- Negative Balance ---
        if (netBalance < 0) {
            insights.add(new Insight(
                    "negative-balance",
                    "Negative Balance",
                    String.format("Your expenses (₹%,.0f) exceed your income (₹%,.0f).",
                            totalSpent, totalIncome),
                    "TrendingDown",
                    "error"
            ));
        }

        // --- Savings Goal Progress ---
        if (savingsGoal > 0) {
            if (savingsGoalProgress >= 100) {
                insights.add(new Insight(
                        "goal-reached",
                        "Goal Reached!",
                        String.format("Congratulations! You've reached your monthly savings goal of ₹%,.0f.",
                                savingsGoal),
                        "TrendingUp",
                        "primary"
                ));
            } else if (savingsGoalProgress > 50) {
                insights.add(new Insight(
                        "goal-on-track",
                        "On Track!",
                        String.format("You're %d%% of the way to your savings goal. Keep going!", savingsGoalProgress),
                        "TrendingUp",
                        "secondary"
                ));
            }
        }

        // --- Top Category ---
        String topCategory = expenseTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (topCategory != null && totalSpent > 0) {
            double topSpend = expenseTotals.get(topCategory);
            if (topSpend > totalSpent * 0.4) {
                insights.add(new Insight(
                        "top-category",
                        "High Spending",
                        String.format("%s accounts for %d%% of your total spending.",
                                topCategory, (int) Math.round((topSpend / totalSpent) * 100)),
                        "Info",
                        "warning"
                ));
            }
        }

        // --- Daily Average vs Daily Budget ---
        double dailyBudget = totalBudget / daysInMonth;
        if (dailyAvg > dailyBudget * 1.2) {
            insights.add(new Insight(
                    "daily-avg",
                    "High Daily Spend",
                    String.format("Your daily average (₹%,.0f) is higher than your daily budget (₹%,.0f).",
                            dailyAvg, dailyBudget),
                    "TrendingDown",
                    "warning"
            ));
        }

        // --- Savings Rate ---
        if (totalIncome > 0) {
            if (savingsRate >= 30) {
                insights.add(new Insight(
                        "savings-rate-high",
                        "Excellent Saving!",
                        String.format("You've saved %d%% of your income this month. Keep it up!", savingsRate),
                        "TrendingUp",
                        "primary"
                ));
            } else if (savingsRate < 10 && savingsRate >= 0) {
                insights.add(new Insight(
                        "savings-rate-low",
                        "Low Savings Rate",
                        String.format("Try to save at least 20%% of your income. Your current rate is %d%%.",
                                savingsRate),
                        "Info",
                        "warning"
                ));
            }
        }

        return insights;
    }
}
