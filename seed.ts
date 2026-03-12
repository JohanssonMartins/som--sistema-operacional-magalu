import { PrismaClient } from '@prisma/client';
import { MOCK_USERS, INITIAL_CHECKLIST } from './src/data';

const prisma = new PrismaClient();


async function main() {
    console.log('Iniciando seed de produção no PostgreSQL...');

    try {
        // 1. Inserir Usuários Mock (Admin, Diretoria, etc)
        console.log('Inserindo Usuários...');
        for (const user of Object.values(MOCK_USERS)) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: {},
                create: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    unidade: user.unidade,
                    password: user.password
                }
            });
        }
        console.log('✅ Usuários inseridos com sucesso.');

        // 2. Inserir Itens Base do Checklist
        console.log('Inserindo Base Checklist Items...');
        for (const item of INITIAL_CHECKLIST) {
            await prisma.baseChecklistItem.upsert({
                where: { id: item.id },
                update: {}, // se já existir, não atualiza para não sobrescrever
                create: {
                    id: item.id,
                    code: item.code,
                    pilar: item.pilar,
                    bloco: item.bloco,
                    trilha: item.trilha,
                    item: item.item,
                    descricao: item.descricao,
                    exigeEvidencia: item.exigeEvidencia,
                    ativo: item.ativo,
                    order: item.order
                }
            });
        }
        console.log('✅ Base Checklist inserido com sucesso.');

        console.log('🎉 Seed completo! Você já pode fazer login no sistema.');

    } catch (error) {
        console.error('❌ Erro no seed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
