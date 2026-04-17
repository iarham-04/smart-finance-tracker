package com.financetracker.model;

import jakarta.persistence.*;

/**
 * Singleton row (id = 1) storing user-level app settings.
 * Currency is stored as three separate columns to avoid a separate table.
 */
@Entity
@Table(name = "app_settings")
public class AppSettings {

    @Id
    private Long id = 1L;

    private String userName = "";

    private Double savingsGoal = 5000.0;

    private Double initialBalance = 0.0;

    // Currency fields
    private String currencyName = "Indian Rupee";
    private String currencySymbol = "₹";
    private String currencyCode = "INR";
    private String currencyFlag = "🇮🇳";

    // History stored as comma-separated values for simplicity
    private String historyIncome = "0,0,0,0,0,0";
    private String historyExpense = "0,0,0,0,0,0";

    public AppSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Double getSavingsGoal() { return savingsGoal; }
    public void setSavingsGoal(Double savingsGoal) { this.savingsGoal = savingsGoal; }

    public Double getInitialBalance() { return initialBalance; }
    public void setInitialBalance(Double initialBalance) { this.initialBalance = initialBalance; }

    public String getCurrencyName() { return currencyName; }
    public void setCurrencyName(String currencyName) { this.currencyName = currencyName; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getCurrencyFlag() { return currencyFlag; }
    public void setCurrencyFlag(String currencyFlag) { this.currencyFlag = currencyFlag; }

    public String getHistoryIncome() { return historyIncome; }
    public void setHistoryIncome(String historyIncome) { this.historyIncome = historyIncome; }

    public String getHistoryExpense() { return historyExpense; }
    public void setHistoryExpense(String historyExpense) { this.historyExpense = historyExpense; }
}
