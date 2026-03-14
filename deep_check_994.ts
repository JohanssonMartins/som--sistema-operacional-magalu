import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check994() {
    try {
        const audits = await prisma.autoauditoria.findMany({
            where: { unidade: '994' },
            include: {
                items: {
                    include: {
                        evidencias: true
                    }
                }
            }
        });
        console.log("Audits for 994:");
        console.dir(audits, { depth: null });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check994();
