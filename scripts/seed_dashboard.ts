import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNIDADES = ['50', '94', '300', '350', '550', '590', '991', '994', '1100', '1250', '1500', '1800', '2500', '2650', '2900', '5200'];
const MES_ANO = 'Março-2026';

async function seed() {
    console.log('🌱 Iniciando população de dados para a apresentação...');

    const baseItems = await prisma.baseChecklistItem.findMany();

    if (baseItems.length === 0) {
        console.error('❌ Nenhum item base encontrado. Abortando.');
        return;
    }

    console.log(`📋 Encontrados ${baseItems.length} itens base.`);

    for (const unidade of UNIDADES) {
        console.log(`🏢 Populando Unidade ${unidade}...`);

        // Busca ou cria a Autoauditoria
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno_tipo: {
                    unidade,
                    mesAno: MES_ANO,
                    tipo: 'AUTO'
                }
            },
            update: {},
            create: {
                unidade,
                mesAno: MES_ANO,
                tipo: 'AUTO'
            }
        });

        // Filtra itens que já existem para poupar tempo
        const existingItems = await prisma.autoauditoriaItem.findMany({
            where: { autoauditoriaId: autoauditoria.id },
            select: { baseItemId: true }
        });
        const existingIds = new Set(existingItems.map(i => i.baseItemId));

        const itemsToCreate = [];

        for (const baseItem of baseItems) {
            if (existingIds.has(baseItem.id)) continue;

            // Gera um score aleatório: 80% de chance de ser 3 (conforme), 20% de ser 1 ou 0
            const rand = Math.random();
            let score = '3';
            if (rand > 0.8) {
                score = Math.random() > 0.5 ? '1' : '0';
            }

            itemsToCreate.push({
                autoauditoriaId: autoauditoria.id,
                baseItemId: baseItem.id,
                score,
                nossaAcao: score !== '3' ? 'Plano de ação em andamento para correção imediata.' : null
            });
        }

        if (itemsToCreate.length > 0) {
            await prisma.autoauditoriaItem.createMany({
                data: itemsToCreate
            });
        }
    }

    console.log('✅ Dados populados com sucesso para todos os CDs!');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
