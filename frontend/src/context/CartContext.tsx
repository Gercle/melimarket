import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCart } from '../api/cart'
import type { Cart } from '../types'
import { useAuth } from './AuthContext'

interface CartContextValue {
  cart: Cart | null
  itemCount: number
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null)
      return
    }
    setLoading(true)
    try {
      const data = await getCart()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
