package com.financetracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @NotBlank
    private String category;

    @NotNull
    @PositiveOrZero
    private Double limitAmount;

    public Budget() {}

    public Budget(String category, Double limitAmount) {
        this.category = category;
        this.limitAmount = limitAmount;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }
}
