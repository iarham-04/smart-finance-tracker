package com.financetracker.service;

import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TransactionService {

    private final TransactionRepository repo;

    public TransactionService(TransactionRepository repo) {
        this.repo = repo;
    }

    public List<Transaction> getAll() {
        return repo.findAllByOrderByDateDescIdDesc();
    }

    public Transaction add(Transaction transaction) {
        if (transaction.getId() == null || transaction.getId().isBlank()) {
            transaction.setId(String.valueOf(Instant.now().toEpochMilli()));
        }
        return repo.save(transaction);
    }

    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Transaction not found: " + id);
        }
        repo.deleteById(id);
    }

    public double totalByType(TransactionType type) {
        return repo.findByType(type)
                .stream()
                .mapToDouble(Transaction::getAmount)
                .sum();
    }
}
