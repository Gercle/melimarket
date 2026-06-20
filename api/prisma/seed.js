const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Categorías base del marketplace
  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 'Autos']

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log('Categorías creadas:', categories)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
