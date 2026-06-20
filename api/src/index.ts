import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import paymentRoutes from './routes/payments'
import categoryRoutes from './routes/categories'
import { apiLimiter, authLimiter } from './middleware/rateLimiter'

const app = express()

// Headers de seguridad (oculta el header X-Powered-By, previene clickjacking, etc.)
app.use(helmet())

// Solo el frontend autorizado puede llamar a esta API desde el browser
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

app.use(express.json())

// Límite general para toda la API
app.use('/api', apiLimiter)

// Límite extra estricto en auth para frenar fuerza bruta sobre login/register
app.use('/api/auth', authLimiter, authRoutes)

app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/categories', categoryRoutes)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`))
