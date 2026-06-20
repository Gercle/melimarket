# melimarket

API y frontend de un marketplace estilo MercadoLibre, hecho como proyecto personal para practicar arquitectura de backend real: transacciones SQL, control de concurrencia, y comunicación asíncrona entre servicios.

## Stack

| Capa | Tecnología |
|---|---|
| API | Node.js + Express + TypeScript |
| Base de datos | MySQL 8 (Docker) |
| ORM | Prisma |
| Worker asíncrono | Java 21 + Spring Boot + Hibernate |
| Frontend | React + Vite + TypeScript + Tailwind |
| Auth | JWT con roles (BUYER / SELLER / ADMIN) |

## Arquitectura

El sistema tiene tres procesos independientes que se comunican a través de la base de datos, no entre sí directamente:

```
┌──────────┐      ┌─────────────────┐      ┌──────────────┐
│ Frontend │ ───► │   API (Node)    │ ───► │  MySQL       │
│ (React)  │      │   Express+TS    │      │  (Docker)    │
└──────────┘      └─────────────────┘      └──────┬───────┘
                                                    │
                                                    │ polling cada 5s
                                                    ▼
                                          ┌──────────────────┐
                                          │  Worker (Java)    │
                                          │  Spring Boot      │
                                          └──────────────────┘
```

Cuando se confirma una orden o se aprueba un pago, la API escribe un evento en la tabla `EventQueue`. El worker en Java hace polling sobre esa tabla, encuentra los eventos `PENDING` y los procesa de forma asíncrona (en una app real, ahí irían notificaciones, emails, actualización de métricas, etc.). Ninguno de los dos procesos se llama directamente — la tabla es el contrato entre ambos. Es el mismo patrón que usan los sistemas de microservicios para no acoplar servicios entre sí.

## Funcionalidades

- **Autenticación**: registro/login con JWT, contraseñas hasheadas con bcrypt, roles con permisos distintos.
- **Catálogo**: búsqueda por nombre, filtro por categoría y rango de precio, paginación.
- **Historial de precios**: cada cambio de precio de un producto queda registrado, nunca se pierde el dato.
- **Carrito**: agregar/quitar productos, valida stock disponible.
- **Órdenes**: se crean dentro de una transacción SQL que descuenta stock de forma segura — usa `UPDATE ... WHERE stock >= cantidad` para evitar vender el mismo producto dos veces si hay compras simultáneas (race condition).
- **Pagos**: simulación de pasarela de pago; al aprobarse, la orden pasa de `PENDING` a `CONFIRMED`.
- **Panel de vendedor**: publicar productos, editar sus datos, cambiar precio (con historial).
- **Worker asíncrono**: procesa eventos de orden confirmada y pago aprobado sin bloquear la respuesta de la API al usuario.
- **Seguridad**: rate limiting (anti fuerza bruta en login), helmet, CORS restringido, control de acceso por dueño de recurso (un vendedor no puede modificar productos de otro).

## Estructura del proyecto

```
melimarket/
├── api/            # Backend Node + TypeScript + Prisma
├── worker/         # Worker Java + Spring Boot
├── frontend/       # React + Vite + TypeScript
├── docker-compose.yml
└── start-all.bat   # Levanta MySQL, API, Worker y Frontend de una
```

## Cómo correrlo

### Requisitos
- Docker Desktop
- Node.js 18+
- JDK 21 + Maven

### Setup inicial (una sola vez)

```bash
cd api
copy .env.example .env   # o el .env que ya tengas configurado
npm install
npx prisma migrate dev
npm run db:seed

cd ../frontend
npm install
```

### Levantar todo

La forma más rápida es correr `start-all.bat` desde la raíz del proyecto, que levanta MySQL, la API, el Worker y el Frontend en ventanas separadas.

O manualmente, cada uno en su propia terminal:

```bash
# 1. Base de datos
docker compose up mysql -d

# 2. API — http://localhost:3000
cd api && npm run dev

# 3. Worker — http://localhost:8080
cd worker && mvn spring-boot:run

# 4. Frontend — http://localhost:5173
cd frontend && npm run dev
```

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Login, devuelve JWT |
| GET | `/api/products` | Catálogo con filtros y paginación |
| GET | `/api/products/:id` | Detalle + historial de precios |
| POST | `/api/products` | Publicar producto (SELLER/ADMIN) |
| PUT | `/api/products/:id` | Editar producto (dueño o ADMIN) |
| PUT | `/api/products/:id/price` | Cambiar precio (dueño o ADMIN) |
| GET / POST / DELETE | `/api/cart` | Carrito del usuario |
| POST | `/api/orders` | Crear orden desde el carrito |
| GET | `/api/orders` / `/api/orders/:id` | Historial / detalle de órdenes |
| POST | `/api/payments` | Pagar una orden |
| GET | `/api/categories` | Listado de categorías |

## Modelo de datos

`User` → `Product` (con `PriceHistory`) → `CartItem` → `Order` (con `OrderItem` y `Payment`) → `EventQueue` (consumida por el worker).

Definido en `api/prisma/schema.prisma`.
