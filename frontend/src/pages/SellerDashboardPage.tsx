import { useEffect, useState, type FormEvent } from 'react'
import { createProduct, getProducts, updateProductPrice } from '../api/products'
import { getCategories } from '../api/categories'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Spinner'
import { EditProductModal } from '../components/EditProductModal'
import { formatPrice } from '../utils/format'
import type { Category, Product } from '../types'

export function SellerDashboardPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // formulario de nuevo producto
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // edición de precio inline
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  // edición completa del producto (nombre, descripción, stock, categoría)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  async function loadProducts() {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const result = await getProducts({ sellerId: String(user.id), limit: 100 })
      setProducts(result.data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setCreating(true)
    try {
      await createProduct({
        name,
        description: description || undefined,
        currentPrice: Number(currentPrice),
        stock: Number(stock),
        categoryId: Number(categoryId),
      })
      setName('')
      setDescription('')
      setCurrentPrice('')
      setStock('')
      setCategoryId('')
      await loadProducts()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  async function handleSavePrice(productId: number) {
    setSavingPrice(true)
    try {
      await updateProductPrice(productId, Number(newPrice))
      setEditingId(null)
      setNewPrice('')
      await loadProducts()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSavingPrice(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-meli-dark">Panel de vendedor</h1>

      <div className="mb-8 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Publicar nuevo producto</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del producto"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none sm:col-span-2"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none sm:col-span-2"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="Precio"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none"
          />
          <input
            required
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none"
          />
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none sm:col-span-2"
          >
            <option value="">Elegí una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-meli-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 sm:col-span-2"
          >
            {creating ? 'Publicando...' : 'Publicar producto'}
          </button>
        </form>
      </div>

      <h2 className="mb-3 text-base font-semibold text-gray-800">Mis productos</h2>

      {loading && <Spinner label="Cargando tus productos..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        products.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Todavía no publicaste ningún producto.</p>
        ) : (
          <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.stock} · {product.category?.name}
                  </p>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="mt-1 text-xs font-medium text-gray-500 hover:underline"
                  >
                    Editar producto
                  </button>
                </div>

                {editingId === product.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-28 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSavePrice(product.id)}
                      disabled={savingPrice}
                      className="rounded-md bg-meli-green px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{formatPrice(product.currentPrice)}</span>
                    <button
                      onClick={() => {
                        setEditingId(product.id)
                        setNewPrice(product.currentPrice)
                      }}
                      className="text-xs font-medium text-meli-blue hover:underline"
                    >
                      Cambiar precio
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null)
            loadProducts()
          }}
        />
      )}
    </div>
  )
}
