import { useEffect, useState } from 'react'
import { getProducts, type ProductFilters } from '../api/products'
import { getCategories } from '../api/categories'
import { ProductCard } from '../components/ProductCard'
import { Spinner } from '../components/Spinner'
import type { Category, PaginatedProducts } from '../types'

const PAGE_SIZE = 12

export function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [result, setResult] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const filters: ProductFilters = { page, limit: PAGE_SIZE }
    if (name) filters.name = name
    if (categoryId) filters.categoryId = categoryId
    if (minPrice) filters.minPrice = minPrice
    if (maxPrice) filters.maxPrice = maxPrice

    setLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      getProducts(filters)
        .then(setResult)
        .catch(() => setError('No se pudieron cargar los productos'))
        .finally(() => setLoading(false))
    }, 300) // debounce simple para no disparar un request por cada tecla

    return () => clearTimeout(timeout)
  }, [name, categoryId, minPrice, maxPrice, page])

  function handleFilterChange<T extends (value: string) => void>(setter: T) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-meli-dark">Productos</h1>

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-4">
        <input
          type="text"
          value={name}
          onChange={(e) => handleFilterChange(setName)(e.target.value)}
          placeholder="Buscar por nombre..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none sm:col-span-2"
        />
        <select
          value={categoryId}
          onChange={(e) => handleFilterChange(setCategoryId)(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => handleFilterChange(setMinPrice)(e.target.value)}
            placeholder="Precio mín."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => handleFilterChange(setMaxPrice)(e.target.value)}
            placeholder="Precio máx."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-meli-blue focus:outline-none"
          />
        </div>
      </div>

      {loading && <Spinner label="Buscando productos..." />}
      {error && <p className="py-8 text-center text-red-600">{error}</p>}

      {!loading && !error && result && (
        <>
          {result.data.length === 0 ? (
            <p className="py-16 text-center text-gray-500">No se encontraron productos con esos filtros.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {result.meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {result.meta.page} de {result.meta.totalPages}
              </span>
              <button
                disabled={page >= result.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
