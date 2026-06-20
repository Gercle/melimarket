package com.melimarket.worker.scheduler;

import com.melimarket.worker.model.EventQueue;
import com.melimarket.worker.model.EventStatus;
import com.melimarket.worker.repository.EventQueueRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Este es el corazón del worker.
 *
 * @Scheduled(fixedDelayString = ...) hace que el método se ejecute
 * cada N milisegundos automáticamente (polling).
 *
 * Flujo por evento:
 * 1. Buscar todos los eventos PENDING
 * 2. Marcarlos como PROCESSING (para que otro worker no los tome en paralelo)
 * 3. Procesarlos según su tipo
 * 4. Marcarlos como SENT o FAILED
 *
 * TODO: mejorar con @Transactional para que el cambio a PROCESSING y el
 * procesamiento sean atómicos (evitar que dos instancias del worker procesen el mismo evento)
 */
@Component
public class EventWorker {

    private final EventQueueRepository eventRepo;

    public EventWorker(EventQueueRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    @Scheduled(fixedDelayString = "${worker.polling.interval:5000}")
    public void processEvents() {
        List<EventQueue> pending = eventRepo.findByStatus(EventStatus.PENDING);

        if (pending.isEmpty()) return;

        System.out.println("[Worker] Procesando " + pending.size() + " evento(s)...");

        for (EventQueue event : pending) {
            try {
                // Marcar como PROCESSING antes de procesar
                event.setStatus(EventStatus.PROCESSING);
                eventRepo.save(event);

                // Delegar según tipo de evento
                switch (event.getEventType()) {
                    case ORDER_CONFIRMED    -> handleOrderConfirmed(event);
                    case PAYMENT_CONFIRMED  -> handlePaymentConfirmed(event);
                    case ORDER_SHIPPED      -> handleOrderShipped(event);
                    case ORDER_DELIVERED    -> handleOrderDelivered(event);
                }

                event.setStatus(EventStatus.SENT);
                event.setProcessedAt(LocalDateTime.now());
                eventRepo.save(event);

                System.out.println("[Worker] Evento #" + event.getId() + " procesado OK");

            } catch (Exception e) {
                event.setStatus(EventStatus.FAILED);
                eventRepo.save(event);
                System.err.println("[Worker] Error en evento #" + event.getId() + ": " + e.getMessage());
            }
        }
    }

    // TODO: implementar cada handler
    // Por ahora solo loguean — acá es donde iría el envío real de emails/push notifications
    private void handleOrderConfirmed(EventQueue event) {
        System.out.println("[Worker] ORDER_CONFIRMED - orden #" + event.getOrderId() + " | payload: " + event.getPayload());
    }

    private void handlePaymentConfirmed(EventQueue event) {
        System.out.println("[Worker] PAYMENT_CONFIRMED - orden #" + event.getOrderId());
    }

    private void handleOrderShipped(EventQueue event) {
        System.out.println("[Worker] ORDER_SHIPPED - orden #" + event.getOrderId());
    }

    private void handleOrderDelivered(EventQueue event) {
        System.out.println("[Worker] ORDER_DELIVERED - orden #" + event.getOrderId());
    }
}
