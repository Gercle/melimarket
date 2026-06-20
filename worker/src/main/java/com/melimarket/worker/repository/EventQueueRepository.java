package com.melimarket.worker.repository;

import com.melimarket.worker.model.EventQueue;
import com.melimarket.worker.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA genera automáticamente el SQL a partir del nombre del método.
 * findByStatus(PENDING) → SELECT * FROM EventQueue WHERE status = 'PENDING'
 * No tenés que escribir nada más.
 */
@Repository
public interface EventQueueRepository extends JpaRepository<EventQueue, Long> {
    List<EventQueue> findByStatus(EventStatus status);
}
