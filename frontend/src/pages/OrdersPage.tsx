import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api/orders'
import { Spinner } from '../components/Spinner'
import { OrderStatusBadge } from '../components/StatusBadge'
import { formatDate, formatPrice } from '../utils/format'
import type { Order } from '../types'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner label="Cargando tus compras..." />

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Todavía no hiciste ninguna compra.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-meli-blue hover:underline">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-meli-dark">Mis compras</h1>

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={order.status === 'PENDING' ? `/checkout/${order.id}` : `/orders/${order.id}`}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:shadow-md"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">Orden #{order.id}</p>
              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              <p className="text-xs text-gray-500">{order.items?.length ?? 0} producto(s)</p>
            </div>
            <div className="text-right">
              <p className="mb-1 font-bold text-meli-dark">{formatPrice(order.total)}</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
