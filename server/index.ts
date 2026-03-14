import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({});
const PORT = Number(process.env.PORT) || 3333;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = await prisma.user.create({ data: req.body });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// Checklist Base Items
app.get('/api/base-items', async (req, res) => {
    try {
        const baseItems = await prisma.baseChecklistItem.findMany();
        res.json(baseItems);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar itens base' });
    }
});

app.post('/api/base-items', async (req, res) => {
    try {
        const item = await prisma.baseChecklistItem.create({ data: req.body });
        res.json(item);
    } catch (error) {
        console.error('CREATE BASE ITEM ERROR:', error);
        res.status(500).json({ error: 'Erro ao criar item base' });
    }
});

app.put('/api/base-items/:id', async (req, res) => {
    try {
        const item = await prisma.baseChecklistItem.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(item);
    } catch (error) {
        console.error('UPDATE BASE ITEM ERROR:', error);
        res.status(500).json({ error: 'Erro ao atualizar item base' });
    }
});

app.delete('/api/base-items/pilar/:pilar', async (req, res) => {
    try {
        const pilarName = req.params.pilar;
        await prisma.baseChecklistItem.deleteMany({ where: { pilar: pilarName } });
        res.json({ success: true });
    } catch (error) {
        console.error('DELETE PILAR ERROR:', error);
        res.status(500).json({ error: 'Erro ao deletar pilar' });
    }
});

app.delete('/api/base-items/:id', async (req, res) => {
    try {
        await prisma.baseChecklistItem.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        console.error('DELETE BASE ITEM ERROR:', error);
        res.status(500).json({ error: 'Erro ao deletar item base' });
    }
});

// Unit specific Checklist Items
app.get('/api/checklists', async (req, res) => {
    try {
        const items = await prisma.checklistItem.findMany({
            include: {
                evidencias: true
            }
        });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar checklists' });
    }
});

app.post('/api/checklists/bulk', async (req, res) => {
    try {
        const items = await prisma.checklistItem.createMany({ data: req.body });
        res.json(items);
    } catch (error) {
        console.error('BULK CREATE CHECKLISTS ERROR:', error);
        res.status(500).json({ error: 'Erro ao criar checklists em massa' });
    }
});

app.put('/api/checklists/:id', async (req, res) => {
    try {
        const item = await prisma.checklistItem.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(item);
    } catch (error) {
        console.error('UPDATE CHECKLIST ERRROR:', error);
        res.status(500).json({ error: 'Erro ao atualizar checklist' });
    }
});

app.post('/api/checklists/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        await prisma.checklistItem.deleteMany({
            where: { id: { in: ids } }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('BULK DELETE CHECKLIST ERROR:', error);
        res.status(500).json({ error: 'Erro ao deletar checklists em massa' });
    }
});

app.post('/api/checklists/bulk-put', async (req, res) => {
    try {
        const updates = req.body.map((item: any) => {
            const { id, evidencias, ...data } = item;
            return prisma.checklistItem.upsert({
                where: { id },
                update: data,
                create: { id, ...data }
            });
        });
        await prisma.$transaction(updates);
        res.json({ success: true });
    } catch (error: any) {
        console.error("ERRO NO BULK PUT:", error?.message || error);
        res.status(500).json({ error: 'Erro ao atualizar checklists em massa', details: error?.message });
    }
});

// Autoauditoria Mensal
app.get('/api/autoauditoria/all/:mesAno', async (req, res) => {
    try {
        const { mesAno } = req.params;
        console.log('GET ALL AUTOAUDITORIA FOR:', mesAno);
        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { mesAno },
            include: {
                items: true
            }
        });
        console.log(`FOUND ${autoauditorias.length} RECORDS`);
        res.json(autoauditorias);
    } catch (error) {
        console.error('GET ALL AUTOAUDITORIA ERROR:', error);
        res.status(500).json({ error: 'Erro ao buscar todas as autoauditorias' });
    }
});

app.get('/api/autoauditoria/:unidade/:mesAno', async (req, res) => {
    try {
        const { unidade, mesAno } = req.params;
        const autoauditoria = await prisma.autoauditoria.findUnique({
            where: {
                unidade_mesAno: {
                    unidade,
                    mesAno
                }
            },
            include: {
                items: {
                    include: {
                        evidencias: true
                    }
                }
            }
        });

        if (!autoauditoria) {
            return res.json(null);
        }
        res.json(autoauditoria);
    } catch (error) {
        console.error('GET AUTOAUDITORIA ERROR:', error);
        res.status(500).json({ error: 'Erro ao buscar autoauditoria' });
    }
});

app.post('/api/autoauditoria', async (req, res) => {
    try {
        const { unidade, mesAno, items } = req.body;

        // 1. Busca ou cria o registro principal de autoauditoria
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno: { unidade, mesAno }
            },
            update: {
                status: 'Pendente de Auditoria' // Reseta status ao salvar
            },
            create: {
                unidade,
                mesAno,
                status: 'Pendente de Auditoria'
            }
        });

        // 2. Salva os items
        const results = [];
        for (const item of items) {
            const { baseItemId, score, nossaAcao, evidencias } = item;

            const savedItem = await prisma.autoauditoriaItem.upsert({
                where: {
                    autoauditoriaId_baseItemId: {
                        autoauditoriaId: autoauditoria.id,
                        baseItemId: baseItemId
                    }
                },
                update: {
                    score,
                    nossaAcao
                },
                create: {
                    autoauditoriaId: autoauditoria.id,
                    baseItemId: baseItemId,
                    score,
                    nossaAcao
                }
            });

            // 3. Opcional: lidar com evidências (se as enviarem em base64)
            // Para simplificar no MVP, a gente pode não tratar o base64 no backend aqui se o req.body já vier preparado
            // Mas o setup relacional já está pronto.
            results.push(savedItem);
        }

        res.json({ success: true, autoauditoria, itemsCount: results.length });
    } catch (error) {
        console.error('POST AUTOAUDITORIA ERROR:', error);
        res.status(500).json({ error: 'Erro ao salvar autoauditoria' });
    }
});

app.get('/api/autoauditoria/history/:unidade', async (req, res) => {
    try {
        const { unidade } = req.params;
        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { unidade },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

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

        res.json(history);
    } catch (error) {
        console.error('GET HISTORY ERROR:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de auditorias' });
    }
});

import multer from 'multer';
import { googleDriveService } from './services/googleDriveService';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // Limite padrao de 15MB
    }
});

app.post('/api/autoauditoria/evidencia/upload', upload.single('file'), async (req: express.Request, res: express.Response) => {
    try {
        const file = req.file;
        const { unidade, mesAno, pilar, bloco, pergunta, baseItemId } = req.body;

        if (!file || !unidade || !mesAno || !pilar || !bloco || !pergunta || !baseItemId) {
            return res.status(400).json({ error: 'Faltam dados essenciais para o upload.' });
        }

        console.log(`[Drive Upload] Iniciando upload para: ${mesAno} > CD ${unidade} > ${pilar} > ${bloco} > ${pergunta}`);

        // 1. Resolve toda a hierarquia de pastas no drive
        const parentFolderId = await googleDriveService.resolveFolderPath(mesAno, unidade, pilar, bloco, pergunta);

        // 2. Faz o upload do arquivo
        const dataOriginal = new Date().getTime();
        const finalFileName = `${dataOriginal}_${file.originalname}`;
        const webViewLink = await googleDriveService.uploadFile(file.buffer, finalFileName, file.mimetype, parentFolderId);

        // 3. Atualizar o banco de dados (relacionar a URL de evidência com a AutoAuditoriaItem)
        // Precisamos garantir que a autoauditoria pai existe antes de atrelarmos 
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno: { unidade, mesAno }
            },
            update: {},
            create: {
                unidade,
                mesAno,
                status: 'Pendente de Auditoria'
            }
        });

        // Upsert do Item que vai levar a evidencia (tabela pai da evidencia)
        const autoauditoriaItem = await prisma.autoauditoriaItem.upsert({
            where: {
                autoauditoriaId_baseItemId: {
                    autoauditoriaId: autoauditoria.id,
                    baseItemId: baseItemId
                }
            },
            update: {}, // Mantemos score e acao anterior
            create: {
                autoauditoriaId: autoauditoria.id,
                baseItemId: baseItemId
            }
        });

        // Finalmente, cria a evidencia apontando a url
        const evidencia = await prisma.evidenciaAutoauditoria.create({
            data: {
                autoauditoriaItemId: autoauditoriaItem.id,
                url: webViewLink,
                name: file.originalname,
            }
        });

        res.json({ success: true, url: webViewLink, evidencia });

    } catch (error: any) {
        console.error('[Drive Upload] Error:', error);
        res.status(500).json({ error: 'Falha no upload para o Drive', details: error?.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
