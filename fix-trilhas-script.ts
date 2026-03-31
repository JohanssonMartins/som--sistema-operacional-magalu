import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpeza das Trilhas no Banco de Dados ---');

  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // 1. Limpar BaseChecklistItem
  const baseItems = await prisma.baseChecklistItem.findMany();
  let baseUpdates = 0;

  for (const item of baseItems) {
    const nTrilha = normalize(item.trilha || "");
    let newTrilha = item.trilha;

    if (nTrilha.includes("gerenciar") || nTrilha.includes("melhorar")) {
      newTrilha = "Gerenciar para melhorar";
    } else if (nTrilha.includes("basico") || nTrilha.includes("feito")) {
      newTrilha = "Básico bem feito";
    }

    if (newTrilha !== item.trilha) {
      await prisma.baseChecklistItem.update({
        where: { id: item.id },
        data: { trilha: newTrilha }
      });
      baseUpdates++;
    }
  }

  // 2. Limpar ChecklistItem (Auditorias já criadas)
  const checklistItems = await prisma.checklistItem.findMany();
  let checklistUpdates = 0;

  for (const item of checklistItems) {
    const nTrilha = normalize(item.trilha || "");
    let newTrilha = item.trilha;

    if (nTrilha.includes("gerenciar") || nTrilha.includes("melhorar")) {
      newTrilha = "Gerenciar para melhorar";
    } else if (nTrilha.includes("basico") || nTrilha.includes("feito")) {
      newTrilha = "Básico bem feito";
    }

    if (newTrilha !== item.trilha) {
      await prisma.checklistItem.update({
        where: { id: item.id },
        data: { trilha: newTrilha }
      });
      checklistUpdates++;
    }
  }

  console.log(`\n--- Resultados da Limpeza ---`);
  console.log(`BaseChecklistItem: ${baseUpdates} itens atualizados.`);
  console.log(`ChecklistItem: ${checklistUpdates} itens de auditoria atualizados.`);
  console.log('--- Limpeza concluída com sucesso! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
