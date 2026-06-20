import rateLimit from 'express-rate-limit'

/**
 * Limita los intentos de login/registro por IP para frenar ataques de
 * fuerza bruta (probar miles de contraseñas) o spam de registros.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10, // 10 intentos por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
})

/**
 * Límite general para el resto de la API, más permisivo pero igual
 * evita que un cliente (o bot) sature el servidor con requests.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Probá de nuevo más tarde.' },
})
