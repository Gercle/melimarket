import { api } from './client'
import type { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories')
  return data
}
