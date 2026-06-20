import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'

/**
 * Simula el pago de una orden.
 * En un sistema real esto llamaría a una pasarela de pago externa (Mercado Pago, Stripe, etc).
 * Acá lo simulamos: el pago siempre se aprueba.
 *
 * Reglas:
 * - La orden tiene que existir y pertenecer al usuario que paga
 * - La orden tiene que estar en estado PENDING (no se puede pagar dos veces)
 * - Todo pasa dentro de una transacción: crear el pago + actualizar la orden +
 *   insertar el evento son atómicos
 */
export async function payOrder(orderId: number, userId: number, method: PaymentMethod = 'CREDIT_CARD') {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
    })

    if (!order) throw new Error('Orden no encontrada')
    if (order.status !== 'PENDING') throw new Error(`La orden ya está en estado ${order.status}, no se puede pagar`)

    const payment = await tx.payment.create({
      data: {
        orderId,
        amount: order.total,
        method,
        status: 'APPROVED',
      },
    })

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    })

    await tx.eventQueue.create({
      data: {
        eventType: 'PAYMENT_CONFIRMED',
        orderId,
        payload: { userId, amount: Number(order.total), method },
      },
    })

    return { payment, order: updatedOrder }
  })
}

export async function getPaymentByOrder(orderId: number, userId: number) {
  return await prisma.payment.findFirst({
    where: {
      orderId,
      order: { userId },
    },
    include: { order: true },
  })
}
