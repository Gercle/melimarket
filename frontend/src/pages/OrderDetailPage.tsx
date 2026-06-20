import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'
import { getPayment } from '../api/payments'
import { Spinner } from '../components/Spinner'
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge'
import { formatDate, formatPrice } from '../utils/format'
import type { Order, Payment } from '../types'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getOrder(Number(id)),
      getPayment(Number(id)).catch(() => null),
    ])
      .then(([orderData, paymentData]) => {
        setOrder(orderData)
        setPayment(paymentData)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner label="Cargando orden..." />
  if (!order) return <p className="py-16 text-center text-gray-500">Orden no encontrada.</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/orders" className="text-sm text-meli-blue hover:underline">← Volver a mis compras</Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-meli-dark">Orden #{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">{formatDate(order.createdAt)}</p>

      <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Productos</h2>
        <ul className="divide-y divide-gray-200">
          {order.items?.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-gray-700">{item.quantity} x {item.product.name}</span>
              <span className="font-medium text-gray-900">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-base font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold text-meli-dark">{formatPrice(order.total)}</span>
        </div>
      </div>

      {payment && (
        <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Pago</h2>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <p className="mt-2 text-sm text-gray-600">Método: {payment.method}</p>
          <p className="text-sm text-gray-600">Monto: {formatPrice(payment.amount)}</p>
          <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
        </div>
      )}
    </div>
  )
}
