import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json(categories)
  } catch (error: unknown) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error interno' })
  }
})

export default router
