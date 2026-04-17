package com.financetracker;

import com.financetracker.model.Transaction;
import com.financetracker.model.TransactionType;
import com.financetracker.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
class TransactionServiceTest {

    @Autowired
    private TransactionService service;

    @BeforeEach
    void clean() {
        service.getAll().forEach(t -> service.delete(t.getId()));
    }

    @Test
    void addAndRetrieveTransaction() {
        Transaction t = new Transaction(null, "Lunch", "Food", 250.0, "2024-10-01", TransactionType.Expense);
        Transaction saved = service.add(t);
        assertThat(saved.getId()).isNotBlank();

        List<Transaction> all = service.getAll();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).getName()).isEqualTo("Lunch");
    }

    @Test
    void deleteTransaction() {
        Transaction t = service.add(new Transaction(null, "Coffee", "Food", 80.0, "2024-10-02", TransactionType.Expense));
        service.delete(t.getId());
        assertThat(service.getAll()).isEmpty();
    }

    @Test
    void deleteNonExistentThrows() {
        assertThatThrownBy(() -> service.delete("non-existent-id"))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void totalByType() {
        service.add(new Transaction(null, "Salary", "Salary", 50000.0, "2024-10-01", TransactionType.Income));
        service.add(new Transaction(null, "Food",   "Food",    1000.0, "2024-10-01", TransactionType.Expense));

        assertThat(service.totalByType(TransactionType.Income)).isEqualTo(50000.0);
        assertThat(service.totalByType(TransactionType.Expense)).isEqualTo(1000.0);
    }
}
