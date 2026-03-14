import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    try {
        const count = await prisma.autoauditoria.count();
        console.log("Total audits in DB:", count);
        
        const units = await prisma.autoauditoria.groupBy({
            by: ['unidade'],
            _count: true
        });
        console.log("Audits by unit:", units);

        const recent = await prisma.autoauditoria.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, unidade: true, mesAno: true, createdAt: true }
        });
        console.log("Recent audits:", recent);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
