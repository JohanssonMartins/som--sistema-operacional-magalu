import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    const audits = await prisma.autoauditoria.findMany({
        where: { unidade: '994' },
        include: {
            _count: {
                select: { items: true }
            }
        }
    });

    console.log("Audits for unit 994:", audits.length);
    audits.forEach(a => {
        console.log(`ID: ${a.id}, mesAno: ${a.mesAno}, status: ${a.status}, items count: ${a._count.items}`);
    });

    const allAudits = await prisma.autoauditoria.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });
    console.log("\nRecent audits (last 10):");
    allAudits.forEach(a => {
        console.log(`Unidade: ${a.unidade}, mesAno: ${a.mesAno}, status: ${a.status}`);
    });

    await prisma.$disconnect();
}

checkData();
