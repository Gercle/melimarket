import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import * as cartService from '../services/cartService'

const router = Router()


router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body
    const item = await cartService.addToCart(req.user!.id, Number(productId), Number(quantity))
    res.status(201).json(item)
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const cart = await cartService.getCart(req.user!.id)
    res.json(cart)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.delete('/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    await cartService.removeFromCart(req.user!.id, Number(req.params.productId))
    res.status(204).send()
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

export default router
