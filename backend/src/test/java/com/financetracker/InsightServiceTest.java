package com.financetracker;

import com.financetracker.model.*;
import com.financetracker.service.InsightService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class InsightServiceTest {

    @Autowired
    private InsightService insightService;

    private Map<String, Double> defaultBudgets() {
        Map<String, Double> b = new LinkedHashMap<>();
        b.put("Food", 8000.0);
        b.put("Transport", 3000.0);
        b.put("Shopping", 5000.0);
        b.put("Health", 2000.0);
        b.put("Entertainment", 2500.0);
        b.put("Bills", 6000.0);
        b.put("Education", 3000.0);
        b.put("Other", 2000.0);
        return b;
    }

    @Test
    void noInsightsWhenNoTransactions() {
        List<Insight> insights = insightService.generateInsights(
                Collections.emptyList(), defaultBudgets(), 5000.0, 0.0);
        assertThat(insights).isEmpty();
    }

    @Test
    void detectsNegativeBalance() {
        Transaction t = new Transaction("1", "Big Spend", "Shopping", 50000.0,
                "2024-10-01", TransactionType.Expense);
        List<Insight> insights = insightService.generateInsights(
                List.of(t), defaultBudgets(), 5000.0, 0.0);
        assertThat(insights).anyMatch(i -> i.getId().equals("negative-balance"));
    }

    @Test
    void detectsBudgetAlert() {
        // Spend 90% of food budget
        Transaction t = new Transaction("2", "Expensive Meal", "Food", 7300.0,
                "2024-10-01", TransactionType.Expense);
        List<Insight> insights = insightService.generateInsights(
                List.of(t), defaultBudgets(), 5000.0, 0.0);
        assertThat(insights).anyMatch(i -> i.getId().equals("budget-Food"));
    }

    @Test
    void detectsSavingsGoalReached() {
        Transaction income = new Transaction("3", "Salary", "Salary", 100000.0,
                "2024-10-01", TransactionType.Income);
        List<Insight> insights = insightService.generateInsights(
                List.of(income), defaultBudgets(), 5000.0, 0.0);
        assertThat(insights).anyMatch(i -> i.getId().equals("goal-reached"));
    }

    @Test
    void detectsExcellentSavingsRate() {
        Transaction income = new Transaction("4", "Salary", "Salary", 100000.0,
                "2024-10-01", TransactionType.Income);
        Transaction expense = new Transaction("5", "Rent", "Bills", 20000.0,
                "2024-10-01", TransactionType.Expense);
        List<Insight> insights = insightService.generateInsights(
                List.of(income, expense), defaultBudgets(), 0.0, 0.0);
        assertThat(insights).anyMatch(i -> i.getId().equals("savings-rate-high"));
    }
}
