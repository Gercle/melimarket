import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SearchParams {
  name?: string
  categoryId?: string | number
  minPrice?: string | number
  maxPrice?: string | number
  sellerId?: string | number
  page?: number | string
  limit?: number | string
}

interface CreateProductParams {
  name: string
  description?: string
  currentPrice: number
  stock: number
  categoryId: number
  sellerId: number
}

interface Requester {
  id: number
  role: string
}

// Un SELLER solo puede modificar sus propios productos. ADMIN puede modificar cualquiera.
function assertOwnership(product: { sellerId: number }, requester: Requester) {
  if (requester.role !== 'ADMIN' && product.sellerId !== requester.id) {
    throw new Error('No tenés permiso para modificar este producto')
  }
}

export async function updatePrice(productId: number, newPrice: number, requester: Requester) {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } })
    if (!product) throw new Error('Producto no encontrado')
    assertOwnership(product, requester)

    await tx.priceHistory.create({
      data: { productId, price: product.currentPrice },
    })

    return await tx.product.update({
      where: { id: productId },
      data: { currentPrice: newPrice },
    })
  })
}

interface UpdateProductParams {
  name?: string
  description?: string
  stock?: number
  categoryId?: number
}

export async function updateProduct(productId: number, data: UpdateProductParams, requester: Requester) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error('Producto no encontrado')
  assertOwnership(product, requester)

  return await prisma.product.update({ where: { id: productId }, data })
}

export async function searchProducts({ name, categoryId, minPrice, maxPrice, sellerId, page = 1, limit = 20 }: SearchParams) {
  const where = {
    ...(name && { name: { contains: name } }),
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(sellerId && { sellerId: Number(sellerId) }),
    ...(minPrice || maxPrice
      ? {
          currentPrice: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        }
      : {}),
    // En el catálogo público se ocultan los productos sin stock,
    // pero el vendedor sí necesita ver los suyos aunque estén en 0
    ...(sellerId ? {} : { stock: { gt: 0 } }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { category: true, seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  }
}

export async function findProductById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: { select: { id: true, name: true } },
      priceHistory: { orderBy: { changedAt: 'desc' } },
    },
  })
}

export async function createProduct({ name, description, currentPrice, stock, categoryId, sellerId }: CreateProductParams) {
  return await prisma.product.create({
    data: { name, description, currentPrice, stock, categoryId, sellerId },
  })
}

export async function deleteProduct(id: number) {
  return await prisma.product.delete({ where: { id } })
}
