import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const canSell = user?.role === 'SELLER' || user?.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-20 bg-meli-dark shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-meli-yellow">
          melimarket
        </Link>

        <nav className="flex flex-1 items-center gap-5 text-sm font-medium text-white">
          <Link to="/" className="hover:text-meli-yellow">Productos</Link>
          {canSell && (
            <Link to="/seller" className="hover:text-meli-yellow">Vender</Link>
          )}
          {user && (
            <Link to="/orders" className="hover:text-meli-yellow">Mis compras</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/cart" className="relative text-white hover:text-meli-yellow">
              <span className="text-sm font-medium">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-meli-yellow text-[11px] font-bold text-meli-dark">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-gray-300 sm:block">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-meli-yellow px-3 py-1.5 text-xs font-semibold text-meli-dark hover:opacity-90"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-meli-yellow px-3 py-1.5 text-xs font-semibold text-meli-dark hover:opacity-90"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
