import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function addToCart(userId: number, productId: number, quantity: number) {
  // Verificar que el producto existe y tiene stock
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Producto no encontrado')
  if (product.stock < quantity) throw new Error('Stock insuficiente')

  // upsert: si ya está en el carrito suma la cantidad, si no lo crea
  return await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId,
      productId,
      quantity,
    },
    include: { product: true },
  })
}

export async function getCart(userId: number) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  })

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.currentPrice) * item.quantity,
    0
  )

  return { items, total }
}

export async function removeFromCart(userId: number, productId: number) {
  return await prisma.cartItem.delete({
    where: { userId_productId: { userId, productId } },
  })
}

export async function clearCart(userId: number) {
  return await prisma.cartItem.deleteMany({ where: { userId } })
}
