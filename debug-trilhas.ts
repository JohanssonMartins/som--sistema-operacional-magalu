
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const baseItems = await prisma.baseChecklistItem.findMany({ select: { trilha: true } });
  const counts: Record<string, number> = {};
  baseItems.forEach(i => {
      const t = i.trilha || "NULL";
      counts[t] = (counts[t] || 0) + 1;
  });
  console.log('Trilhas encontradas na BaseChecklistItem:');
  console.log(JSON.stringify(counts, null, 2));

  const checklistItems = await prisma.checklistItem.findMany({ select: { trilha: true } });
  const countsChecklist: Record<string, number> = {};
  checklistItems.forEach(i => {
      const t = i.trilha || "NULL";
      countsChecklist[t] = (countsChecklist[t] || 0) + 1;
  });
  console.log('Trilhas encontradas na ChecklistItem:');
  console.log(JSON.stringify(countsChecklist, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
