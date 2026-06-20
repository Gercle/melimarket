import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getApiErrorMessage, TOKEN_KEY } from '../api/client'
import { decodeToken, isTokenExpired } from '../utils/jwt'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readInitialUser(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const decoded = decodeToken(token)
  if (!decoded || isTokenExpired(decoded)) {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
  return decoded
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readInitialUser)
  const [loading, setLoading] = useState(false)

  // Si el token expira mientras la app está abierta, desloguea automáticamente
  useEffect(() => {
    if (!user?.exp) return
    const msUntilExpiry = user.exp * 1000 - Date.now()
    if (msUntilExpiry <= 0) {
      logout()
      return
    }
    const timeout = setTimeout(() => logout(), msUntilExpiry)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(decodeToken(data.token))
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  async function register(email: string, name: string, password: string) {
    setLoading(true)
    try {
      await api.post('/auth/register', { email, name, password })
      await login(email, password)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
