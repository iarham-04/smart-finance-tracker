package com.financetracker.service;

import com.financetracker.model.AppSettings;
import com.financetracker.repository.AppSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class AppSettingsService {

    private static final long SETTINGS_ID = 1L;

    private final AppSettingsRepository repo;
    private final BudgetService budgetService;
    private final TransactionService transactionService;

    public AppSettingsService(AppSettingsRepository repo,
                              BudgetService budgetService,
                              TransactionService transactionService) {
        this.repo = repo;
        this.budgetService = budgetService;
        this.transactionService = transactionService;
    }

    public AppSettings get() {
        return repo.findById(SETTINGS_ID).orElseGet(() -> {
            AppSettings defaults = new AppSettings();
            defaults.setId(SETTINGS_ID);
            return repo.save(defaults);
        });
    }

    public AppSettings save(AppSettings incoming) {
        incoming.setId(SETTINGS_ID);
        return repo.save(incoming);
    }

    /**
     * Resets settings, all transactions, and all budgets back to factory defaults.
     */
    public void resetAll() {
        repo.deleteById(SETTINGS_ID);
        transactionService.getAll().forEach(t -> transactionService.delete(t.getId()));
        budgetService.reset();
        // Persist fresh defaults
        get();
    }
}
