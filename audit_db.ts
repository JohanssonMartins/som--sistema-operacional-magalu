import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const audits = await prisma.autoauditoria.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- ALL AUDITS ---');
  audits.forEach(a => {
    console.log(`ID: ${a.id} | Unit: [${a.unidade}] | Month: [${a.mesAno}] | Created: ${a.createdAt}`);
  });
}
main().finally(() => prisma.$disconnect());
