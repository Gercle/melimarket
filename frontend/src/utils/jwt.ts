import type { AuthUser } from '../types'

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Solo se usa para leer datos (id, email, role) en el frontend para la UI.
 * La verificación real de la firma siempre la hace el backend.
 */
export function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized))
    return decoded as AuthUser
  } catch {
    return null
  }
}

export function isTokenExpired(user: AuthUser | null): boolean {
  if (!user?.exp) return false
  return Date.now() >= user.exp * 1000
}
