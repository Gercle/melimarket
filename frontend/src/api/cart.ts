import { api } from './client'
import type { Cart, CartItem } from '../types'

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<Cart>('/cart')
  return data
}

export async function addToCart(productId: number, quantity: number): Promise<CartItem> {
  const { data } = await api.post<CartItem>('/cart', { productId, quantity })
  return data
}

export async function removeFromCart(productId: number): Promise<void> {
  await api.delete(`/cart/${productId}`)
}
