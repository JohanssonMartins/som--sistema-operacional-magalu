
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApi() {
  const mesAno = "Março-2026";
  console.log(`Testing API for month: ${mesAno}`);

  const autoauditorias = await prisma.autoauditoria.findMany({
    where: { mesAno },
    include: { items: true }
  });

  console.log(`Found ${autoauditorias.length} records.`);
  autoauditorias.forEach(a => {
    console.log(`- CD: ${a.unidade} | Month: ${a.mesAno} | Items: ${a.items.length}`);
  });

  const all = await prisma.autoauditoria.findMany();
  console.log(`\nTotal records in DB: ${all.length}`);
  
  await prisma.$disconnect();
}

testApi();
