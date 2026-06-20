package com.melimarket.worker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Mapea la tabla event_queue que Prisma creó.
 * El worker lee los eventos PENDING y los procesa.
 *
 * @Entity le dice a Hibernate que esta clase es una tabla
 * @Table(name = "EventQueue") coincide con el nombre que Prisma genera
 */
@Entity
@Table(name = "EventQueue")
public class EventQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "eventType", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Column(name = "orderId")
    private Long orderId;

    // JSON guardado como String — podés parsearlo con Jackson si necesitás campos específicos
    @Column(name = "payload", columnDefinition = "JSON")
    private String payload;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.PENDING;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @Column(name = "processedAt")
    private LocalDateTime processedAt;

    // TODO: generar getters y setters (o usar Lombok con @Data)
    public Long getId() { return id; }
    public EventType getEventType() { return eventType; }
    public Long getOrderId() { return orderId; }
    public String getPayload() { return payload; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
