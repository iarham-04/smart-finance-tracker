package com.financetracker.model;

import java.util.List;
import java.util.Map;

/**
 * DTO holding aggregated summary statistics for the dashboard.
 */
public class Summary {

    private double totalIncome;
    private double totalSpent;
    private double netBalance;
    private double savingsRate;
    private double dailyAvg;
    private double projectedExpense;
    private double projectedSavings;
    private int savingsGoalProgress;
    private String topCategory;
    private Map<String, Double> categoryTotals;
    private List<Insight> insights;

    public Summary() {}

    public double getTotalIncome() { return totalIncome; }
    public void setTotalIncome(double totalIncome) { this.totalIncome = totalIncome; }

    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }

    public double getNetBalance() { return netBalance; }
    public void setNetBalance(double netBalance) { this.netBalance = netBalance; }

    public double getSavingsRate() { return savingsRate; }
    public void setSavingsRate(double savingsRate) { this.savingsRate = savingsRate; }

    public double getDailyAvg() { return dailyAvg; }
    public void setDailyAvg(double dailyAvg) { this.dailyAvg = dailyAvg; }

    public double getProjectedExpense() { return projectedExpense; }
    public void setProjectedExpense(double projectedExpense) { this.projectedExpense = projectedExpense; }

    public double getProjectedSavings() { return projectedSavings; }
    public void setProjectedSavings(double projectedSavings) { this.projectedSavings = projectedSavings; }

    public int getSavingsGoalProgress() { return savingsGoalProgress; }
    public void setSavingsGoalProgress(int savingsGoalProgress) { this.savingsGoalProgress = savingsGoalProgress; }

    public String getTopCategory() { return topCategory; }
    public void setTopCategory(String topCategory) { this.topCategory = topCategory; }

    public Map<String, Double> getCategoryTotals() { return categoryTotals; }
    public void setCategoryTotals(Map<String, Double> categoryTotals) { this.categoryTotals = categoryTotals; }

    public List<Insight> getInsights() { return insights; }
    public void setInsights(List<Insight> insights) { this.insights = insights; }
}
