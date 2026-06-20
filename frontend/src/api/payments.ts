import { api } from './client'
import type { PayOrderResult, Payment, PaymentMethod } from '../types'

export async function payOrder(orderId: number, method: PaymentMethod = 'CREDIT_CARD'): Promise<PayOrderResult> {
  const { data } = await api.post<PayOrderResult>('/payments', { orderId, method })
  return data
}

export async function getPayment(orderId: number): Promise<Payment> {
  const { data } = await api.get<Payment>(`/payments/${orderId}`)
  return data
}
