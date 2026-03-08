import { PrismaClient as PrismaClientPG } from '@prisma/client';
import sqlite3 from 'better-sqlite3';

// 1. Cliente Prisma configurado para apontar para o PostgreSQL de produção
const postgresPrisma = new PrismaClientPG({
    datasourceUrl: 'postgresql://neondb_owner:npg_IDi28HaGpmbS@ep-nameless-term-acdmwfs0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

// 2. Conexão direta com o SQLite antigo para extrair os dados
const sqliteDb = new sqlite3('./dev.db');

async function migrateData() {
    console.log('Iniciando migração de dados...');

    try {
        // ==== USUÁRIOS ====
        console.log('Migrando Usuários...');
        const users = sqliteDb.prepare('SELECT * FROM User').all() as any[];
        for (const user of users) {
            // Ignora erro se usuário já existir
            const existing = await postgresPrisma.user.findUnique({ where: { email: user.email } });
            if (!existing) {
                await postgresPrisma.user.create({ data: user });
            }
        }
        console.log(`✅ ${users.length} usuários migrados.`);

        // ==== ITENS BASE CHECKLIST ====
        console.log('Migrando BaseChecklistItems...');
        const baseItems = sqliteDb.prepare('SELECT * FROM BaseChecklistItem').all() as any[];

        // Deleta os baseItems existentes no postgres para garantir que ficam iguais (evita duplicação rodando o script várias vezes)
        await postgresPrisma.baseChecklistItem.deleteMany({});

        for (const item of baseItems) {
            // Converte valores numéricos caso tenha divergência (SQLite guarda boolean como 0/1)
            await postgresPrisma.baseChecklistItem.create({
                data: {
                    id: item.id,
                    code: item.code,
                    pilar: item.pilar,
                    bloco: item.bloco,
                    trilha: item.trilha,
                    item: item.item,
                    descricao: item.descricao,
                    exigeEvidencia: Boolean(item.exigeEvidencia),
                    ativo: Boolean(item.ativo),
                    order: item.order,
                    nossaAcao: item.nossaAcao
                }
            });
        }
        console.log(`✅ ${baseItems.length} itens base do checklist migrados.`);

        console.log('🎉 Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        sqliteDb.close();
        await postgresPrisma.$disconnect();
    }
}

migrateData();
