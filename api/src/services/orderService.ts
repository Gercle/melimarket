import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createOrderFromCart(userId: number) {
  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })

    if (cartItems.length === 0) throw new Error('El carrito está vacío')

    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.product.currentPrice) * item.quantity,
      0
    )

    const order = await tx.order.create({
      data: {
        userId,
        total,
        // status nace en PENDING (default del schema) hasta que se confirme el pago
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.currentPrice,
          })),
        },
      },
    })

    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      })

      if (updated.count === 0) {
        throw new Error(`Stock insuficiente para el producto ${item.product.name}`)
      }
    }

    await tx.cartItem.deleteMany({ where: { userId } })

    await tx.eventQueue.create({
      data: {
        eventType: 'ORDER_CONFIRMED',
        orderId: order.id,
        payload: { userId, total, itemCount: cartItems.length },
      },
    })

    return order
  })
}
