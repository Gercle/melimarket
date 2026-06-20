import { Router, Request, Response } from 'express'
import { authenticate, requireRole } from '../middleware/auth'
import * as productService from '../services/productService'

const router = Router()


router.get('/', async (req: Request, res: Response) => {
  try {
    const { name, categoryId, minPrice, maxPrice, sellerId, page = 1, limit = 20 } = req.query
    const products = await productService.searchProducts({
      name: name as string,
      categoryId: categoryId as string,
      minPrice: minPrice as string,
      maxPrice: maxPrice as string,
      sellerId: sellerId as string,
      page: Number(page),
      limit: Number(limit),
    })
    res.json(products)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await productService.findProductById(Number(req.params.id))
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' })
      return
    }
    res.json(product)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.post('/', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, description, currentPrice, stock, categoryId } = req.body
    const product = await productService.createProduct({
      name,
      description,
      currentPrice: Number(currentPrice),
      stock: Number(stock),
      categoryId: Number(categoryId),
      sellerId: req.user!.id,
    })
    res.status(201).json(product)
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.put('/:id/price', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const updated = await productService.updatePrice(Number(req.params.id), Number(req.body.newPrice), req.user!)
    res.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno'
    res.status(message.includes('permiso') ? 403 : 400).json({ error: message })
  }
})


router.put('/:id', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, description, stock, categoryId } = req.body
    const updated = await productService.updateProduct(
      Number(req.params.id),
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      },
      req.user!
    )
    res.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno'
    res.status(message.includes('permiso') ? 403 : 400).json({ error: message })
  }
})


router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(Number(req.params.id))
    res.status(204).send()
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

export default router
