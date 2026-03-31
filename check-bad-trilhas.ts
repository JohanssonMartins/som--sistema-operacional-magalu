
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const std1 = "Básico bem feito";
  const std2 = "Gerenciar para melhorar";

  const baseItems = await prisma.baseChecklistItem.findMany();
  const badBase = baseItems.filter(i => i.trilha !== std1 && i.trilha !== std2);
  
  console.log(`BaseChecklistItem: Encontrados ${badBase.length} itens com trilha não-padrão.`);
  badBase.forEach(i => console.log(`ID: ${i.id} | Trilha: "${i.trilha}"`));

  const checklistItems = await prisma.checklistItem.findMany();
  const badChecklist = checklistItems.filter(i => i.trilha !== std1 && i.trilha !== std2);

  console.log(`ChecklistItem: Encontrados ${badChecklist.length} itens com trilha não-padrão.`);
  badChecklist.forEach(i => console.log(`ID: ${i.id} | Trilha: "${i.trilha}"`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
