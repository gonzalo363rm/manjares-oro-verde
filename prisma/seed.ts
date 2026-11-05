import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "mesas-dulces" },
    update: {},
    create: {
      name: "Mesas dulces",
      slug: "mesas-dulces",
    },
  });

  await prisma.product.upsert({
    where: { slug: "cupcakes-x12" },
    update: {
      name: "Cupcakes x12",
      price: 18000,
      active: true,
      categoryId: category.id,
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Cupcakes x12",
      slug: "cupcakes-x12",
      description: "Docena de cupcakes decorados",
      price: 18000,
      active: true,
      categoryId: category.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "torta-personalizada" },
    update: {
      name: "Torta personalizada",
      price: null,
      active: true,
      categoryId: category.id,
    },
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Torta personalizada",
      slug: "torta-personalizada",
      description: "Diseño a medida — consultar",
      price: null,
      active: true,
      categoryId: category.id,
    },
  });

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
