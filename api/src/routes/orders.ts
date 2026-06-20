import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import * as orderService from '../services/orderService'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const order = await orderService.createOrderFromCart(req.user!.id)
        res.status(201).json(order)
    } catch (error: unknown) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
    }
    })

    
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})


router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: Number(req.params.id), userId: req.user!.id },
      include: { items: { include: { product: true } } },
    })
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' })
      return
    }
    res.json(order)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

export default router