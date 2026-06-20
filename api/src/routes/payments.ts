import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import * as paymentService from '../services/paymentService'

const router = Router()

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { orderId, method } = req.body
    if (!orderId) {
      res.status(400).json({ error: 'orderId es requerido' })
      return
    }
    const result = await paymentService.payOrder(Number(orderId), req.user!.id, method)
    res.status(201).json(result)
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

router.get('/:orderId', authenticate, async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.getPaymentByOrder(Number(req.params.orderId), req.user!.id)
    if (!payment) {
      res.status(404).json({ error: 'Pago no encontrado' })
      return
    }
    res.json(payment)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

export default router
