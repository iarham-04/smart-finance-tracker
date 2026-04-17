package com.financetracker.model;

import java.util.Map;

/**
 * DTO returned by the /api/exchange-rates endpoint.
 */
public class ExchangeRateResponse {

    private Map<String, Double> rates;
    private long lastUpdated;
    private boolean offline;

    public ExchangeRateResponse() {}

    public ExchangeRateResponse(Map<String, Double> rates, long lastUpdated, boolean offline) {
        this.rates = rates;
        this.lastUpdated = lastUpdated;
        this.offline = offline;
    }

    public Map<String, Double> getRates() { return rates; }
    public void setRates(Map<String, Double> rates) { this.rates = rates; }

    public long getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(long lastUpdated) { this.lastUpdated = lastUpdated; }

    public boolean isOffline() { return offline; }
    public void setOffline(boolean offline) { this.offline = offline; }
}
