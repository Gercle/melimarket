export type Role = 'BUYER' | 'SELLER' | 'ADMIN'

export interface AuthUser {
  id: number
  email: string
  role: Role
  exp?: number
}

export interface Category {
  id: number
  name: string
}

export interface Seller {
  id: number
  name: string
}

export interface PriceHistoryEntry {
  id: number
  price: string
  changedAt: string
}

export interface Product {
  id: number
  name: string
  description?: string | null
  currentPrice: string
  stock: number
  sellerId: number
  categoryId: number
  createdAt: string
  updatedAt: string
  category?: Category
  seller?: Seller
  priceHistory?: PriceHistoryEntry[]
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedProducts {
  data: Product[]
  meta: PaginationMeta
}

export interface CartItem {
  id: number
  userId: number
  productId: number
  quantity: number
  product: Product
}

export interface Cart {
  items: CartItem[]
  total: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: string
  product: Product
}

export interface Order {
  id: number
  userId: number
  status: OrderStatus
  total: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'
export type PaymentStatus = 'APPROVED' | 'REJECTED'

export interface Payment {
  id: number
  orderId: number
  amount: string
  method: PaymentMethod
  status: PaymentStatus
  createdAt: string
  order?: Order
}

export interface PayOrderResult {
  payment: Payment
  order: Order
}
