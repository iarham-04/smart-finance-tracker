package com.financetracker.controller;

import com.financetracker.model.Budget;
import com.financetracker.service.BudgetService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    /** Returns all budgets as { category: limitAmount } map. */
    @GetMapping
    public Map<String, Double> getAll() {
        return service.getAll();
    }

    /**
     * Updates a single category budget.
     * Body: { "limitAmount": 9000.0 }
     */
    @PutMapping("/{category}")
    public Budget update(@PathVariable String category,
                         @RequestBody Map<String, Double> body) {
        double limitAmount = body.getOrDefault("limitAmount", 0.0);
        return service.update(category, limitAmount);
    }
}
