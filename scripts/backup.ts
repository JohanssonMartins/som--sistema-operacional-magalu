import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function backup() {
    console.log('📦 Iniciando backup do banco de dados...');
    
    try {
        const data = {
            users: await prisma.user.findMany(),
            baseChecklistItems: await prisma.baseChecklistItem.findMany(),
            checklistItems: await prisma.checklistItem.findMany({
                include: { evidencias: true }
            }),
            autoauditorias: await prisma.autoauditoria.findMany({
                include: { 
                    items: {
                        include: { evidencias: true }
                    }
                }
            })
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const fileName = `backup-${timestamp}.json`;
        const filePath = path.join(backupDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Backup concluído com sucesso!`);
        console.log(`📂 Arquivo salvo em: ${filePath}`);
        console.log(`📊 Estatísticas:`);
        console.log(`   - Usuários: ${data.users.length}`);
        console.log(`   - Itens Base: ${data.baseChecklistItems.length}`);
        console.log(`   - Checklists: ${data.checklistItems.length}`);
        console.log(`   - Autoauditorias: ${data.autoauditorias.length}`);

    } catch (error) {
        console.error('❌ Erro durante o backup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

backup();
