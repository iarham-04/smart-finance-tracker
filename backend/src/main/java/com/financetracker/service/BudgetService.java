package com.financetracker.service;

import com.financetracker.model.Budget;
import com.financetracker.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {

    /** Default INR budget limits matching the TypeScript constants. */
    private static final Map<String, Double> DEFAULT_BUDGETS = new LinkedHashMap<>();

    static {
        DEFAULT_BUDGETS.put("Food", 8000.0);
        DEFAULT_BUDGETS.put("Transport", 3000.0);
        DEFAULT_BUDGETS.put("Shopping", 5000.0);
        DEFAULT_BUDGETS.put("Health", 2000.0);
        DEFAULT_BUDGETS.put("Entertainment", 2500.0);
        DEFAULT_BUDGETS.put("Bills", 6000.0);
        DEFAULT_BUDGETS.put("Education", 3000.0);
        DEFAULT_BUDGETS.put("Other", 2000.0);
    }

    private final BudgetRepository repo;

    public BudgetService(BudgetRepository repo) {
        this.repo = repo;
    }

    /**
     * Returns all budgets.  On first call, seeds the DB with defaults.
     */
    public Map<String, Double> getAll() {
        List<Budget> budgets = repo.findAll();
        if (budgets.isEmpty()) {
            seed();
            budgets = repo.findAll();
        }
        Map<String, Double> result = new LinkedHashMap<>();
        budgets.forEach(b -> result.put(b.getCategory(), b.getLimitAmount()));
        return result;
    }

    public Budget update(String category, double limitAmount) {
        Budget budget = repo.findById(category)
                .orElse(new Budget(category, limitAmount));
        budget.setLimitAmount(limitAmount);
        return repo.save(budget);
    }

    public void reset() {
        repo.deleteAll();
        seed();
    }

    private void seed() {
        DEFAULT_BUDGETS.forEach((cat, limit) -> repo.save(new Budget(cat, limit)));
    }
}
