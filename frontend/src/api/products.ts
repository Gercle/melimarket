import { api } from './client'
import type { PaginatedProducts, Product } from '../types'

export interface ProductFilters {
  name?: string
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  sellerId?: string
  page?: number
  limit?: number
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params: filters })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

export interface CreateProductInput {
  name: string
  description?: string
  currentPrice: number
  stock: number
  categoryId: number
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/products', input)
  return data
}

export async function updateProductPrice(id: number, newPrice: number): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}/price`, { newPrice })
  return data
}

export interface UpdateProductInput {
  name?: string
  description?: string
  stock?: number
  categoryId?: number
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, input)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}
