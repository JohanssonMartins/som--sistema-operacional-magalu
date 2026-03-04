import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({});
const PORT = process.env.PORT || 3333;

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
