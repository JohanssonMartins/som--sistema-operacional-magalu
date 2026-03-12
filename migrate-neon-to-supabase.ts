import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Configuração dos clientes Prisma
// O cliente padrão usa o DATABASE_URL do .env (que será o Supabase)
const supabasePrisma = new PrismaClient();

// Cliente específico para o Neon (origem)
// Usamos a URL antiga do Neon diretamente para a migração
const NEON_URL = "postgresql://neondb_owner:npg_IDi28HaGpmbS@ep-nameless-term-acdmwfs0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const neonPrisma = new PrismaClient({
    datasources: {
        db: {
            url: NEON_URL,
        },
    },
});

async function migrateData() {
    console.log('🚀 Iniciando migração de Neon para Supabase...');

    try {
        // 1. Migrar Usuários
        console.log('👥 Migrando Usuários...');
        const users = await neonPrisma.user.findMany();
        for (const user of users) {
            await supabasePrisma.user.upsert({
                where: { email: user.email },
                update: user,
                create: user,
            });
        }
        console.log(`✅ ${users.length} usuários migrados.`);

        // 2. Migrar Itens Base do Checklist
        console.log('📋 Migrando BaseChecklistItems...');
        const baseItems = await neonPrisma.baseChecklistItem.findMany();
        for (const item of baseItems) {
            await supabasePrisma.baseChecklistItem.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`✅ ${baseItems.length} itens base migrados.`);

        // 3. Migrar Itens de Checklist (Unidades)
        console.log('📝 Migrando ChecklistItems...');
        const checklistItems = await neonPrisma.checklistItem.findMany();
        for (const item of checklistItems) {
            const { id, ...data } = item;
            await supabasePrisma.checklistItem.upsert({
                where: { id },
                update: data,
                create: item,
            });
        }
        console.log(`✅ ${checklistItems.length} itens de checklist migrados.`);

        // 4. Migrar Evidências
        console.log('📎 Migrando Evidências...');
        const evidencias = await neonPrisma.evidencia.findMany();
        for (const evidencia of evidencias) {
            await supabasePrisma.evidencia.upsert({
                where: { id: evidencia.id },
                update: evidencia,
                create: evidencia,
            });
        }
        console.log(`✅ ${evidencias.length} evidências migradas.`);

        // 5. Migrar Autoauditorias
        console.log('📊 Migrando Autoauditorias...');
        const autoauditorias = await neonPrisma.autoauditoria.findMany();
        for (const audit of autoauditorias) {
            const { id, ...data } = audit;
            await supabasePrisma.autoauditoria.upsert({
                where: { id },
                update: data,
                create: audit,
            });
        }
        console.log(`✅ ${autoauditorias.length} autoauditorias migradas.`);

        // 6. Migrar Itens de Autoauditoria
        console.log('📉 Migrando AutoauditoriaItems...');
        const auditItems = await neonPrisma.autoauditoriaItem.findMany();
        for (const item of auditItems) {
            const { id, ...data } = item;
            await supabasePrisma.autoauditoriaItem.upsert({
                where: { id },
                update: data,
                create: item,
            });
        }
        console.log(`✅ ${auditItems.length} itens de autoauditoria migrados.`);

        // 7. Migrar Evidências de Autoauditoria
        console.log('📁 Migrando EvidenciasAutoauditoria...');
        const auditEvidencias = await neonPrisma.evidenciaAutoauditoria.findMany();
        for (const evidencia of auditEvidencias) {
            await supabasePrisma.evidenciaAutoauditoria.upsert({
                where: { id: evidencia.id },
                update: evidencia,
                create: evidencia,
            });
        }
        console.log(`✅ ${auditEvidencias.length} evidências de autoauditoria migradas.`);

        console.log('🎉 Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        await neonPrisma.$disconnect();
        await supabasePrisma.$disconnect();
    }
}

migrateData();
