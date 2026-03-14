import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHistory() {
  const unidads = ['50', '94', '300'];
  const months = [
    { name: 'Setembro-2025', date: new Date(2025, 8, 15), baseScore: 40 },
    { name: 'Outubro-2025', date: new Date(2025, 9, 15), baseScore: 55 },
    { name: 'Novembro-2025', date: new Date(2025, 10, 15), baseScore: 62 },
    { name: 'Dezembro-2025', date: new Date(2025, 11, 15), baseScore: 68 },
    { name: 'Janeiro-2026', date: new Date(2026, 0, 15), baseScore: 75 },
    { name: 'Fevereiro-2026', date: new Date(2026, 1, 15), baseScore: 82 },
  ];

  const baseItems = await prisma.baseChecklistItem.findMany();

  for (const unidade of unidads) {
    console.log(`Seeding history for unit ${unidade}...`);
    for (const month of months) {
      const autoauditoria = await prisma.autoauditoria.upsert({
        where: {
          unidade_mesAno: { unidade, mesAno: month.name },
        },
        update: {
          createdAt: month.date,
        },
        create: {
          unidade,
          mesAno: month.name,
          status: 'Auditado',
          createdAt: month.date,
        },
      });

      // Create items with varying scores to simulate performance
      for (const baseItem of baseItems) {
        // Random score based on a trend
        const rand = Math.random() * 20 - 5; // -5 to +15
        const targetScore = month.baseScore + rand;
        
        let score = '0';
        if (targetScore > 75) score = '3';
        else if (targetScore > 40) score = '1';

        await prisma.autoauditoriaItem.upsert({
          where: {
            autoauditoriaId_baseItemId: {
              autoauditoriaId: autoauditoria.id,
              baseItemId: baseItem.id,
            },
          },
          update: { score },
          create: {
            autoauditoriaId: autoauditoria.id,
            baseItemId: baseItem.id,
            score,
          },
        });
      }
    }
  }
  console.log('Seed completed successfully!');
}

seedHistory()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
