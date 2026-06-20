import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOrder } from '../api/orders'
import { payOrder } from '../api/payments'
import { Spinner } from '../components/Spinner'
import { OrderStatusBadge } from '../components/StatusBadge'
import { getApiErrorMessage } from '../api/client'
import { formatPrice } from '../utils/format'
import type { Order, PaymentMethod } from '../types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito',
  CASH: 'Efectivo',
}

export function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (!orderId) return
    getOrder(Number(orderId))
      .then((data) => {
        setOrder(data)
        if (data.status !== 'PENDING') setPaid(true)
      })
      .catch(() => setError('No se pudo cargar la orden'))
      .finally(() => setLoading(false))
  }, [orderId])

  async function handlePay() {
    if (!order) return
    setPaying(true)
    setError(null)
    try {
      const result = await payOrder(order.id, method)
      setOrder(result.order)
      setPaid(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <Spinner label="Cargando orden..." />
  if (!order) return <p className="py-16 text-center text-red-600">{error || 'Orden no encontrada'}</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-meli-dark">Orden #{order.id}</h1>
      <div className="mb-6"><OrderStatusBadge status={order.status} /></div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        {order.items && (
          <ul className="mb-4 divide-y divide-gray-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span className="text-gray-700">{item.quantity} x {item.product.name}</span>
                <span className="font-medium text-gray-900">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-base font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold text-meli-dark">{formatPrice(order.total)}</span>
        </div>
      </div>

      {!paid ? (
        <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Método de pago</h2>
          <div className="flex flex-col gap-2">
            {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                />
                {METHOD_LABELS[m]}
              </label>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={handlePay}
            disabled={paying}
            className="mt-5 w-full rounded-md bg-meli-green px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {paying ? 'Procesando pago...' : `Pagar ${formatPrice(order.total)}`}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg bg-green-50 p-5 text-center">
          <p className="font-semibold text-green-700">¡Pago confirmado!</p>
          <p className="mt-1 text-sm text-green-600">Tu orden fue procesada con éxito.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/orders" className="text-sm font-medium text-meli-blue hover:underline">
              Ver mis compras
            </Link>
            <button onClick={() => navigate('/')} className="text-sm font-medium text-meli-blue hover:underline">
              Seguir comprando
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
