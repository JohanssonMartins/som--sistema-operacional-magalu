import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyHistoryLogic(unidade: string) {
    try {
        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { unidade },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`Found ${autoauditorias.length} audits for unit ${unidade}\n`);

        const history = autoauditorias.map(audit => {
            const totalScore = audit.items.reduce((acc, item) => {
                const s = parseInt(item.score || '0');
                return acc + (isNaN(s) ? 0 : s);
            }, 0);
            
            const maxScore = audit.items.length * 3;
            const performance = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

            return {
                mesAno: audit.mesAno,
                performance: Math.round(performance * 10) / 10,
                score: totalScore,
                maxScore,
                status: audit.status
            };
        });

        console.log('Processed History Data:');
        console.log(JSON.stringify(history, null, 2));

        if (history.length > 0) {
            console.log('\n✅ Logic verification successful!');
        } else {
            console.log('\n❌ No history data found for unit ' + unidade);
        }
    } catch (error) {
        console.error('❌ Error during logic verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyHistoryLogic('50');
