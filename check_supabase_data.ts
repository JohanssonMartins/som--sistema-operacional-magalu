
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const userCount = await prisma.user.count();
        const users = await prisma.user.findMany({ take: 5 });
        console.log('Total de usuários:', userCount);
        console.log('Primeiros 5 usuários:', users.map(u => u.email));
        
        const itemCount = await prisma.checklistItem.count();
        console.log('Total de itens de checklist:', itemCount);
    } catch (e) {
        console.error('Erro ao conectar ao banco:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
