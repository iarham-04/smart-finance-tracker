package com.financetracker.controller;

import com.financetracker.model.AppSettings;
import com.financetracker.service.AppSettingsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class AppSettingsController {

    private final AppSettingsService service;

    public AppSettingsController(AppSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public AppSettings get() {
        return service.get();
    }

    @PutMapping
    public AppSettings save(@RequestBody AppSettings settings) {
        return service.save(settings);
    }

    /** Hard reset – clears all transactions, budgets, and settings. */
    @DeleteMapping("/reset")
    public void reset() {
        service.resetAll();
    }
}
