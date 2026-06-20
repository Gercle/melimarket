import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct } from '../api/products'
import { addToCart } from '../api/cart'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getApiErrorMessage } from '../api/client'
import { formatDate, formatPrice } from '../utils/format'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProduct(Number(id))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    if (!product) return
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    setMessage(null)
    try {
      await addToCart(product.id, quantity)
      await refreshCart()
      setMessage({ type: 'success', text: 'Agregado al carrito' })
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error) })
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <Spinner label="Cargando producto..." />
  if (!product) return <p className="py-16 text-center text-gray-500">Producto no encontrado.</p>

  const outOfStock = product.stock <= 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-7xl font-bold text-gray-300">
          {product.name.charAt(0).toUpperCase()}
        </div>

        <div>
          {product.category && (
            <span className="text-xs uppercase tracking-wide text-gray-400">{product.category.name}</span>
          )}
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.seller && (
            <p className="mt-1 text-sm text-gray-500">Vendido por {product.seller.name}</p>
          )}

          <p className="mt-4 text-3xl font-bold text-meli-dark">{formatPrice(product.currentPrice)}</p>

          {product.description && (
            <p className="mt-4 text-sm text-gray-600">{product.description}</p>
          )}

          <p className={`mt-4 text-sm font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {outOfStock ? 'Sin stock disponible' : `${product.stock} unidades disponibles`}
          </p>

          {!outOfStock && (
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-gray-600">Cantidad:</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={outOfStock || adding}
            className="mt-5 w-full rounded-md bg-meli-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {adding ? 'Agregando...' : 'Agregar al carrito'}
          </button>

          {message && (
            <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      {product.priceHistory && product.priceHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Historial de precios</h2>
          <ul className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
            {product.priceHistory.map((entry) => (
              <li key={entry.id} className="flex justify-between px-4 py-2 text-sm">
                <span className="text-gray-500">{formatDate(entry.changedAt)}</span>
                <span className="font-medium text-gray-800">{formatPrice(entry.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
