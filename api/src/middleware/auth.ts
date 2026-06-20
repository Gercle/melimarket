import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion'

// Extendemos el tipo de Request para incluir req.user
export interface AuthPayload {
  id: number
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthPayload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Sin permisos suficientes' })
      return
    }
    next()
  }
}
