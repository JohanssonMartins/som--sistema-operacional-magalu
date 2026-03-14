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
app.get('/api/autoauditoria/history/:unidade', async (req, res) => {
    try {
        const { unidade } = req.params;
        
        // 1. Buscar itens base para mapear pilares
        const baseItems = await prisma.baseChecklistItem.findMany();
        const baseItemMap = new Map(baseItems.map(item => [item.id, item.pilar]));

        // 2. Buscar auditorias da unidade selecionada
        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { unidade },
            include: {
                items: true
            }
        });

        // 3. Identificar os meses presentes para calcular média da rede
        const uniqueMonths = [...new Set(autoauditorias.map(a => a.mesAno))];
        
        // 4. Buscar todas as auditorias desses meses para o benchmark
        const allAuditsInMonths = await prisma.autoauditoria.findMany({
            where: {
                mesAno: { in: uniqueMonths }
            },
            include: {
                items: true
            }
        });

        // 5. Calcular média da rede por mês
        const networkAvgByMonth: Record<string, number> = {};
        uniqueMonths.forEach(mes => {
            const audits = allAuditsInMonths.filter(a => a.mesAno === mes);
            let monthTotalScore = 0;
            let monthMaxScore = 0;
            
            audits.forEach(audit => {
                audit.items.forEach(item => {
                    const s = parseInt(item.score || '0');
                    monthTotalScore += (isNaN(s) ? 0 : s);
                    monthMaxScore += 3;
                });
            });
            
            networkAvgByMonth[mes] = monthMaxScore > 0 
                ? Math.round((monthTotalScore / monthMaxScore) * 1000) / 10 
                : 0;
        });

        // 6. Processar histórico final com pilares
        const history = autoauditorias.map(audit => {
            const pillarScores: Record<string, { score: number, max: number }> = {};
            
            audit.items.forEach(item => {
                const pilar = baseItemMap.get(item.baseItemId) || 'Outros';
                const s = parseInt(item.score || '0');
                const val = (isNaN(s) ? 0 : s);
                
                if (!pillarScores[pilar]) pillarScores[pilar] = { score: 0, max: 0 };
                pillarScores[pilar].score += val;
                pillarScores[pilar].max += 3;
            });

            const totalScore = audit.items.reduce((acc, item) => {
                const s = parseInt(item.score || '0');
                return acc + (isNaN(s) ? 0 : s);
            }, 0);
            
            const maxScore = audit.items.length * 3;
            const performance = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

            const pillars: Record<string, number> = {};
            Object.entries(pillarScores).forEach(([name, data]) => {
                pillars[name] = data.max > 0 ? Math.round((data.score / data.max) * 1000) / 10 : 0;
            });

            return {
                mesAno: audit.mesAno,
                performance: Math.round(performance * 10) / 10,
                score: totalScore,
                maxScore,
                status: audit.status,
                pillars,
                networkAvg: networkAvgByMonth[audit.mesAno] || 0
            };
        });

        // Ordenação cronológica
        const monthOrder: Record<string, number> = {
            'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
            'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
        };

        history.sort((a, b) => {
            const [monthA, yearA] = a.mesAno.split('-');
            const [monthB, yearB] = b.mesAno.split('-');
            const yrA = parseInt(yearA);
            const yrB = parseInt(yearB);
            if (yrA !== yrB) return yrA - yrB;
            return (monthOrder[monthA] || 0) - (monthOrder[monthB] || 0);
        });

        res.json(history);
    } catch (error) {
        console.error('GET HISTORY ERROR:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de auditorias' });
    }
});

app.get('/api/autoauditoria/all/:mesAno', async (req, res) => {
    try {
        const { mesAno } = req.params;
        console.log(`[API] Buscando todas as autoauditorias para: ${mesAno}`);
        
        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { mesAno },
            include: {
                items: true
            }
        });

        console.log(`[API] Sucesso: Encontradas ${autoauditorias.length} auditorias para ${mesAno}`);
        res.json(autoauditorias);
    } catch (error) {
        console.error('[API] Erro ao buscar autoauditorias:', error);
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
