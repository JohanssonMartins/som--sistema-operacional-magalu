import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function restore() {
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
        console.error('❌ Pasta "backups" não encontrada.');
        return;
    }

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    
    if (files.length === 0) {
        console.error('❌ Nenhum arquivo de backup encontrado na pasta "backups".');
        return;
    }

    const latestBackup = files[0];
    const filePath = path.join(backupDir, latestBackup);
    
    console.log(`🔄 Restaurando do backup mais recente: ${latestBackup}...`);

    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);

        // 1. Restaurar Usuários
        console.log('👥 Restaurando Usuários...');
        for (const user of data.users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: user,
                create: user
            });
        }

        // 2. Restaurar Itens Base
        console.log('📋 Restaurando BaseChecklistItems...');
        for (const item of data.baseChecklistItems) {
            await prisma.baseChecklistItem.upsert({
                where: { id: item.id },
                update: item,
                create: item
            });
        }

        // 3. Restaurar Checklists e Evidências
        console.log('📝 Restaurando ChecklistItems e Evidências...');
        for (const item of data.checklistItems) {
            const { evidencias, ...itemData } = item;
            await prisma.checklistItem.upsert({
                where: { id: item.id },
                update: itemData,
                create: itemData
            });

            if (evidencias && evidencias.length > 0) {
                for (const evid of evidencias) {
                    await prisma.evidencia.upsert({
                        where: { id: evid.id },
                        update: evid,
                        create: evid
                    });
                }
            }
        }

        // 4. Restaurar Autoauditorias, Itens e Evidências
        console.log('📊 Restaurando Autoauditorias...');
        for (const audit of data.autoauditorias) {
            const { items, ...auditData } = audit;
            await prisma.autoauditoria.upsert({
                where: { id: audit.id },
                update: auditData,
                create: auditData
            });

            if (items && items.length > 0) {
                for (const item of items) {
                    const { evidencias, ...itemData } = item;
                    await prisma.autoauditoriaItem.upsert({
                        where: { id: item.id },
                        update: itemData,
                        create: itemData
                    });

                    if (evidencias && evidencias.length > 0) {
                        for (const evid of evidencias) {
                            await prisma.evidenciaAutoauditoria.upsert({
                                where: { id: evid.id },
                                update: evid,
                                create: evid
                            });
                        }
                    }
                }
            }
        }

        console.log('🎉 Restauração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a restauração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restore();
