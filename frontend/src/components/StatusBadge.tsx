import type { OrderStatus, PaymentStatus } from '../types'

const ORDER_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const ORDER_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STYLES[status]}`}>
      {ORDER_LABELS[status]}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_STYLES[status]}`}>
      {PAYMENT_LABELS[status]}
    </span>
  )
}
