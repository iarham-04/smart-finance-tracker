package com.financetracker.service;

import com.financetracker.model.ExchangeRateResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Proxies live exchange-rate data and falls back to hardcoded rates when
 * the external API is unavailable, exactly mirroring the TypeScript FALLBACK_RATES.
 */
@Service
public class ExchangeRateService {

    private static final String RATE_URL =
            "https://api.exchangerate-api.com/v4/latest/INR";

    private static final Map<String, Double> FALLBACK_RATES = new HashMap<>();

    static {
        FALLBACK_RATES.put("USD", 0.012);
        FALLBACK_RATES.put("EUR", 0.011);
        FALLBACK_RATES.put("GBP", 0.0096);
        FALLBACK_RATES.put("JPY", 1.78);
        FALLBACK_RATES.put("AED", 0.044);
        FALLBACK_RATES.put("CAD", 0.016);
        FALLBACK_RATES.put("AUD", 0.019);
        FALLBACK_RATES.put("CHF", 0.011);
        FALLBACK_RATES.put("CNY", 0.087);
        FALLBACK_RATES.put("INR", 1.0);
    }

    private final RestTemplate restTemplate;

    /** Thread-safe in-memory cache: avoid hitting the external API on every request. */
    private final AtomicReference<ExchangeRateResponse> cachedRates = new AtomicReference<>(null);
    private final AtomicLong cacheTimestamp = new AtomicLong(0L);
    private static final long CACHE_TTL_MS = 24 * 60 * 60 * 1000L; // 24 hours

    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }

    public ExchangeRateResponse getRates() {
        long now = System.currentTimeMillis();
        ExchangeRateResponse cached = cachedRates.get();
        if (cached != null && (now - cacheTimestamp.get()) < CACHE_TTL_MS) {
            return cached;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(RATE_URL, Map.class);
            if (response != null && response.containsKey("rates")) {
                @SuppressWarnings("unchecked")
                Map<String, Number> rawRates = (Map<String, Number>) response.get("rates");
                Map<String, Double> rates = new HashMap<>();
                rawRates.forEach((k, v) -> rates.put(k, v.doubleValue()));
                ExchangeRateResponse fresh = new ExchangeRateResponse(rates, now, false);
                cachedRates.set(fresh);
                cacheTimestamp.set(now);
                return fresh;
            }
        } catch (Exception e) {
            // Fall through to offline fallback
        }
        return new ExchangeRateResponse(FALLBACK_RATES, now, true);
    }
}
