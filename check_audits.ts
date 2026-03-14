import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const audits = await prisma.autoauditoria.findMany({
    include: {
      items: true
    }
  });

  console.log(`All Audits in DB:`);
  audits.forEach(audit => {
    const totalItems = audit.items.length;
    const score3Count = audit.items.filter(i => i.score === '3').length;
    
    console.log(`Month: ${audit.mesAno} | CD ${audit.unidade}:`);
    console.log(`  Items: ${totalItems}, Score 3: ${score3Count}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
