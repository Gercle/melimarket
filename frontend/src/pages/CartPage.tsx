import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromCart } from '../api/cart'
import { createOrder } from '../api/orders'
import { useCart } from '../context/CartContext'
import { Spinner } from '../components/Spinner'
import { getApiErrorMessage } from '../api/client'
import { formatPrice } from '../utils/format'

export function CartPage() {
  const { cart, loading, refreshCart } = useCart()
  const navigate = useNavigate()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove(productId: number) {
    setRemovingId(productId)
    setError(null)
    try {
      await removeFromCart(productId)
      await refreshCart()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setRemovingId(null)
    }
  }

  async function handleCheckout() {
    setCreatingOrder(true)
    setError(null)
    try {
      const order = await createOrder()
      await refreshCart()
      navigate(`/checkout/${order.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setCreatingOrder(false)
    }
  }

  if (loading) return <Spinner label="Cargando carrito..." />

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Tu carrito está vacío.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-meli-blue hover:underline">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-meli-dark">Tu carrito</h1>

      <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-lg font-bold text-gray-300">
                {item.product.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} x {formatPrice(item.product.currentPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(Number(item.product.currentPrice) * item.quantity)}
              </p>
              <button
                onClick={() => handleRemove(item.productId)}
                disabled={removingId === item.productId}
                className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <span className="text-lg font-semibold text-gray-800">Total</span>
        <span className="text-2xl font-bold text-meli-dark">{formatPrice(cart.total)}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={creatingOrder}
        className="mt-4 w-full rounded-md bg-meli-blue px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {creatingOrder ? 'Generando orden...' : 'Confirmar compra'}
      </button>
    </div>
  )
}
