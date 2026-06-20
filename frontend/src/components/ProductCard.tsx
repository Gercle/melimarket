import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock <= 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-gray-100 text-4xl font-bold text-gray-300">
        {product.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-gray-400">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-meli-blue">
          {product.name}
        </h3>
        <p className="mt-1 text-xl font-semibold text-gray-900">{formatPrice(product.currentPrice)}</p>
        {outOfStock ? (
          <span className="mt-1 text-xs font-semibold text-red-500">Sin stock</span>
        ) : (
          <span className="mt-1 text-xs text-gray-500">{product.stock} disponibles</span>
        )}
      </div>
    </Link>
  )
}
