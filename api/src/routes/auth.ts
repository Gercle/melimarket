import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { JWT_SECRET } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()


router.post('/register', async (req: Request, res: Response) => {
  const { email, name, password } = req.body

  if (!email || !name || !password) {
    res.status(400).json({ error: 'Email, name y password son requeridos' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'El email ya está registrado' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, name, password: hashedPassword },
  })

  const { password: _, ...userWithoutPassword } = user
  res.status(201).json(userWithoutPassword)
})


router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email y password son requeridos' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Credenciales inválidas' })
    return
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    res.status(401).json({ error: 'Credenciales inválidas' })
    return
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({ token })
})

export default router
