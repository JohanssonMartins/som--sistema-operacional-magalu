import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';

// Store em memória para códigos de redefinição de senha (email -> { code, expiresAt })
const passwordResetTokens = new Map<string, { code: string; expiresAt: number }>();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const prisma = new PrismaClient({});
const PORT = Number(process.env.PORT) || 3333;

// Gerenciamento de Usuários Online e Recentes via Socket.io
interface OnlineUserInfo {
    userId: string;
    socketId: string;
    name: string;
    email: string;
    role: string;
    unidade: string;
    photo?: string | null;
    connectedAt: number;
    lastSeenAt?: number;
}
const onlineUsers = new Map<string, OnlineUserInfo>(); // socketId -> OnlineUserInfo
// Histórico de acessos recentes (mantém os últimos 30 usuários únicos com timestamp)
const recentAccesses = new Map<string, OnlineUserInfo>(); // userId -> OnlineUserInfo

const getUniqueOnlineUsers = () => {
    const uniqueMap = new Map<string, OnlineUserInfo>();
    for (const user of onlineUsers.values()) {
        if (!uniqueMap.has(user.userId)) {
            uniqueMap.set(user.userId, user);
        }
    }
    return Array.from(uniqueMap.values());
};

const getRecentUsersList = () => {
    const list = Array.from(recentAccesses.values());
    // Ordena do mais recente para o mais antigo
    return list.sort((a, b) => (b.lastSeenAt || b.connectedAt) - (a.lastSeenAt || a.connectedAt)).slice(0, 30);
};

const emitOnlineUsers = () => {
    const onlineList = getUniqueOnlineUsers();
    const recentList = getRecentUsersList();
    console.log(`[Socket] Usuários online: ${onlineList.length} | Recentes: ${recentList.length}`);
    io.emit('users:online', onlineList);
    io.emit('users:recent', recentList);
};

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`[Socket] Novo cliente conectado: ${socket.id}`);

    // Cliente envia seus dados de autenticação/presença
    socket.on('user:presence', (userData: { id: string; name: string; email: string; role: string; unidade: string; photo?: string | null }) => {
        if (userData && userData.id) {
            const now = Date.now();
            const userInfo: OnlineUserInfo = {
                userId: userData.id,
                socketId: socket.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                unidade: userData.unidade,
                photo: userData.photo,
                connectedAt: now,
                lastSeenAt: now
            };
            onlineUsers.set(socket.id, userInfo);
            recentAccesses.set(userData.id, userInfo);
            emitOnlineUsers();
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Cliente desconectado: ${socket.id}`);
        const user = onlineUsers.get(socket.id);
        if (user) {
            // Atualiza lastSeenAt no histórico de recentes
            recentAccesses.set(user.userId, {
                ...user,
                lastSeenAt: Date.now()
            });
            onlineUsers.delete(socket.id);
            emitOnlineUsers();
        }
    });
});

// Funcao utilitaria para notificar todos os clientes sobre mudancas
const notifyDataChange = (event: string, data: any) => {
    console.log(`[Socket] Emitindo evento: ${event}`, data);
    io.emit(event, data);
};

const monthsArray = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthOrder: Record<string, number> = {
    'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
    'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
};

function getCurrentRealWorldMonth(): string {
    const date = new Date();
    const month = monthsArray[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${year}`;
}

function getNextMonthStr(mesAno: string): string {
    const [month, yearStr] = mesAno.split('-');
    const year = parseInt(yearStr);
    const monthIndex = monthOrder[month];
    if (monthIndex === undefined || isNaN(year)) {
        return '';
    }
    if (monthIndex === 11) {
        return `${monthsArray[0]}-${year + 1}`;
    } else {
        return `${monthsArray[monthIndex + 1]}-${year}`;
    }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Users
app.get('/api/users/online', (req, res) => {
    res.json(getUniqueOnlineUsers());
});

app.get('/api/users/recent', (req, res) => {
    res.json(getRecentUsersList());
});

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

// Configuração flexível de E-mail (SMTP .env se fornecido, sem chamadas externas lentas)
const getEmailTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            connectionTimeout: 3000,
            socketTimeout: 3000,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });
    }
    return null;
};

// 🔑 Solicitacao de Redefinicao de Senha (envia e-mail com codigo de confirmacao)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Informe o seu e-mail cadastrado.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma.user.findFirst({
            where: {
                email: { equals: normalizedEmail, mode: 'insensitive' }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Nenhum usuário foi encontrado com este e-mail.' });
        }

        // Gera codigo numerico de 6 digitos (ex: 749201) com validade de 15 minutos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        passwordResetTokens.set(normalizedEmail, { code, expiresAt });

        let emailSent = false;
        const transporter = getEmailTransporter();

        if (transporter) {
            // Dispara envio de e-mail de forma assíncrona
            transporter.sendMail({
                from: '"SOM - Sistema Operacional Magalog" <nao-responda@magalu.com>',
                to: normalizedEmail,
                subject: '🔑 Código de Redefinição de Senha - SOM Magalog',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800;">SOM MAGALOG</h1>
                            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Sistema Operacional Magalog</p>
                        </div>
                        
                        <h2 style="font-size: 18px; color: #1e293b; margin-bottom: 12px;">Olá, <strong>${user.name}</strong>!</h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Recebemos uma solicitação para redefinir a sua senha de acesso ao sistema SOM. Use o código abaixo para confirmar a alteração:</p>

                        <div style="background-color: #fffbe6; border: 2px dashed #f59e0b; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
                            <span style="font-size: 11px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Código de Confirmação</span>
                            <div style="font-size: 36px; font-weight: 900; color: #d97706; letter-spacing: 8px;">${code}</div>
                            <span style="font-size: 12px; color: #78350f; display: block; margin-top: 8px;">⏱ Válido por 15 minutos</span>
                        </div>

                        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Se você não fez essa solicitação, pode ignorar este e-mail com segurança. Sua senha permanecerá inalterada.</p>
                        
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">© 2026 Magalu · Sistema Operacional SOM</p>
                    </div>
                `
            }).then(() => {
                console.log(`[AUTH] E-mail com código de redefinição enviado com sucesso para ${normalizedEmail}`);
            }).catch(mailErr => {
                console.error('[AUTH Mail Error]', mailErr.message);
            });
            emailSent = true;
        }

        console.log(`[AUTH] Código de redefinição gerado para ${normalizedEmail}: ${code}`);

        res.json({
            success: true,
            message: 'Código de confirmação gerado!',
            emailSent,
            devCode: code
        });
    } catch (error) {
        console.error('Erro ao solicitar redefinicao:', error);
        res.status(500).json({ error: 'Erro interno ao solicitar a redefinição de senha.' });
    }
});

// 🔒 Confirmacao da Redefinicao de Senha
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Informe o e-mail, código e a nova senha.' });
        }

        if (newPassword.length < 3) {
            return res.status(400).json({ error: 'A nova senha deve ter pelo menos 3 caracteres.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const record = passwordResetTokens.get(normalizedEmail);

        if (!record || record.code !== code.trim()) {
            return res.status(400).json({ error: 'Código de verificação incorreto ou inválido.' });
        }

        if (Date.now() > record.expiresAt) {
            passwordResetTokens.delete(normalizedEmail);
            return res.status(400).json({ error: 'O código de verificação expirou. Solicite um novo código.' });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPassword }
        });

        // Limpa o token utilizado
        passwordResetTokens.delete(normalizedEmail);

        console.log(`[AUTH] Senha do usuário ${normalizedEmail} atualizada com sucesso!`);

        res.json({
            success: true,
            message: 'Senha redefinida com sucesso! Você já pode fazer login.'
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro ao salvar nova senha.' });
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

app.post('/api/base-items/bulk', async (req, res) => {
    try {
        const items = await prisma.baseChecklistItem.createMany({ 
            data: req.body,
            skipDuplicates: true 
        });
        res.json(items);
    } catch (error) {
        console.error('BULK CREATE BASE ITEMS ERROR:', error);
        res.status(500).json({ error: 'Erro ao criar itens base em massa' });
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

        // 1 & 2. Buscar itens base ativos e auditorias da unidade em paralelo
        const [baseItems, autoauditorias] = await Promise.all([
            prisma.baseChecklistItem.findMany({ where: { ativo: true } }),
            prisma.autoauditoria.findMany({
                where: { unidade, tipo: 'AUTO' },
                include: {
                    items: true
                }
            })
        ]);

        // Agrupar itens base ativos por pilar
        const pilarItemsMap: Record<string, typeof baseItems> = {};
        baseItems.forEach(item => {
            if (!pilarItemsMap[item.pilar]) pilarItemsMap[item.pilar] = [];
            pilarItemsMap[item.pilar].push(item);
        });

        // 3. Identificar os meses presentes para calcular média da rede
        const uniqueMonths = [...new Set(autoauditorias.map(a => a.mesAno))];

        // 4. Buscar todas as auditorias desses meses para o benchmark
        const allAuditsInMonths = uniqueMonths.length > 0
            ? await prisma.autoauditoria.findMany({
                where: {
                    mesAno: { in: uniqueMonths },
                    tipo: 'AUTO'
                },
                include: {
                    items: true
                }
            })
            : [];

        // 5. Calcular média da rede por mês (alinhado com a base ativa de itens)
        const networkAvgByMonth: Record<string, number> = {};
        uniqueMonths.forEach(mes => {
            const audits = allAuditsInMonths.filter(a => a.mesAno === mes);
            if (audits.length === 0) {
                networkAvgByMonth[mes] = 0;
                return;
            }

            let sumAuditPct = 0;
            audits.forEach(audit => {
                const auditMap = new Map(audit.items.map(i => [i.baseItemId, i]));
                let totalPts = 0;
                let naCount = 0;

                baseItems.forEach(bi => {
                    const ai = auditMap.get(bi.id);
                    if (ai?.score === '3') totalPts += 3;
                    else if (ai?.score === '1') totalPts += 1;
                    else if (ai?.score === 'N/A') naCount++;
                });

                const maxPossible = (baseItems.length - naCount) * 3;
                const pct = maxPossible > 0 ? (totalPts / maxPossible) * 100 : 0;
                sumAuditPct += pct;
            });

            networkAvgByMonth[mes] = Math.round((sumAuditPct / audits.length) * 10) / 10;
        });

        // 6. Processar histórico final com pilares idêntico ao cálculo dos cards do Dashboard
        const history = autoauditorias.map(audit => {
            const auditMap = new Map(audit.items.map(i => [i.baseItemId, i]));
            const pillars: Record<string, number> = {};

            let totalAuditPoints = 0;
            let totalAuditNa = 0;

            baseItems.forEach(bi => {
                const ai = auditMap.get(bi.id);
                if (ai?.score === '3') totalAuditPoints += 3;
                else if (ai?.score === '1') totalAuditPoints += 1;
                else if (ai?.score === 'N/A') totalAuditNa++;
            });

            const overallMax = (baseItems.length - totalAuditNa) * 3;
            const overallPerformance = overallMax > 0 ? (totalAuditPoints / overallMax) * 100 : 0;

            Object.entries(pilarItemsMap).forEach(([pilarName, items]) => {
                let pilarPoints = 0;
                let pilarNa = 0;

                items.forEach(bi => {
                    const ai = auditMap.get(bi.id);
                    if (ai?.score === '3') pilarPoints += 3;
                    else if (ai?.score === '1') pilarPoints += 1;
                    else if (ai?.score === 'N/A') pilarNa++;
                });

                const pilarMax = (items.length - pilarNa) * 3;
                pillars[pilarName] = pilarMax > 0 ? Math.round((pilarPoints / pilarMax) * 1000) / 10 : 0;
            });

            return {
                mesAno: audit.mesAno,
                performance: Math.round(overallPerformance * 10) / 10,
                score: totalAuditPoints,
                maxScore: overallMax,
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
        const tipo = req.query.tipo as string || 'AUTO';
        console.log(`[API] Buscando todas as autoauditorias para: ${mesAno} (${tipo})`);

        const autoauditorias = await prisma.autoauditoria.findMany({
            where: { mesAno, tipo },
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
        const tipo = req.query.tipo as string || 'AUTO';
        let autoauditoria = await prisma.autoauditoria.findUnique({
            where: {
                unidade_mesAno_tipo: {
                    unidade,
                    mesAno,
                    tipo
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
        const { unidade, mesAno, items, tipo = 'AUTO' } = req.body;

        // 1. Busca ou cria o registro principal de autoauditoria
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno_tipo: { unidade, mesAno, tipo }
            },
            update: {
                status: 'Pendente de Auditoria' // Reseta status ao salvar
            },
            create: {
                unidade,
                mesAno,
                tipo,
                status: 'Pendente de Auditoria'
            }
        });

        // 2. Salva os items
        const currentRealMonth = getCurrentRealWorldMonth();
        const isCurrentMonth = mesAno === currentRealMonth;
        const nextMonthStr = getNextMonthStr(mesAno);
        
        let nextMonthAudit = null;
        if (isCurrentMonth && nextMonthStr) {
            nextMonthAudit = await prisma.autoauditoria.findUnique({
                where: {
                    unidade_mesAno_tipo: { unidade, mesAno: nextMonthStr, tipo }
                }
            });
        }

        const results = await Promise.all(items.map(async (item: any) => {
            const { baseItemId, score, nossaAcao } = item;

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

            // Replicação para o próximo mês (caso esteja aberto)
            if (nextMonthAudit) {
                await prisma.autoauditoriaItem.upsert({
                    where: {
                        autoauditoriaId_baseItemId: {
                            autoauditoriaId: nextMonthAudit.id,
                            baseItemId: baseItemId
                        }
                    },
                    update: {
                        score,
                        nossaAcao
                    },
                    create: {
                        autoauditoriaId: nextMonthAudit.id,
                        baseItemId: baseItemId,
                        score,
                        nossaAcao
                    }
                });
            }

            return savedItem;
        }));

        res.json({ success: true, autoauditoria, itemsCount: results.length });

        // Notifica clientes em tempo real
        notifyDataChange('autoauditoria_updated', { unidade, mesAno });
        if (nextMonthAudit) {
            notifyDataChange('autoauditoria_updated', { unidade, mesAno: nextMonthStr });
        }
    } catch (error) {
        console.error('POST AUTOAUDITORIA ERROR:', error);
        res.status(500).json({ error: 'Erro ao salvar autoauditoria' });
    }
});

import multer from 'multer';
import { googleDriveService } from './services/googleDriveService';
import { aiService } from './services/aiService';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // Limite padrao de 15MB
    }
});

app.post('/api/autoauditoria/evidencia/upload', upload.single('file'), async (req: any, res: any) => {
    try {
        const file = req.file;
        const { unidade, mesAno, pilar, bloco, pergunta, baseItemId, tipo = 'AUTO' } = req.body;

        if (!file || !unidade || !mesAno || !pilar || !bloco || !pergunta || !baseItemId) {
            return res.status(400).json({ error: 'Faltam dados essenciais para o upload.' });
        }

        console.log(`[Drive Upload] Iniciando upload para: ${mesAno} > CD ${unidade} > ${pilar} > ${bloco} > ${pergunta} (${tipo})`);

        // 1. Resolve toda a hierarquia de pastas no drive
        const parentFolderId = await googleDriveService.resolveFolderPath(mesAno, unidade, pilar, bloco, pergunta, tipo);

        // 2. Faz o upload do arquivo
        const dataOriginal = new Date().getTime();
        const finalFileName = `${dataOriginal}_${file.originalname}`;
        const { id: fileId, url: webViewLink } = await googleDriveService.uploadFile(file.buffer, finalFileName, file.mimetype, parentFolderId) as any;

        // 3. Atualizar o banco de dados (relacionar a URL de evidência com a AutoAuditoriaItem)
        // Precisamos garantir que a autoauditoria pai existe antes de atrelarmos 
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno_tipo: { unidade, mesAno, tipo }
            },
            update: {},
            create: {
                unidade,
                mesAno,
                tipo,
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

        // 3. (Removido) Mantemos os anexos de DRIVE anteriores para permitir múltiplos envios

        // 4. Finalmente, cria a evidencia apontando a url
        const evidencia = await prisma.evidenciaAutoauditoria.create({
            data: {
                autoauditoriaItemId: autoauditoriaItem.id,
                url: webViewLink,
                name: fileId, // ID no Drive
            }
        });

        // Replicação para o próximo mês (caso esteja aberto)
        const currentRealMonth = getCurrentRealWorldMonth();
        const isCurrentMonth = mesAno === currentRealMonth;
        const nextMonthStr = getNextMonthStr(mesAno);
        let nextMonthAudit = null;

        if (isCurrentMonth && nextMonthStr) {
            nextMonthAudit = await prisma.autoauditoria.findUnique({
                where: {
                    unidade_mesAno_tipo: { unidade, mesAno: nextMonthStr, tipo }
                }
            });
            if (nextMonthAudit) {
                const nextMonthItem = await prisma.autoauditoriaItem.upsert({
                    where: {
                        autoauditoriaId_baseItemId: {
                            autoauditoriaId: nextMonthAudit.id,
                            baseItemId: baseItemId
                        }
                    },
                    update: {},
                    create: {
                        autoauditoriaId: nextMonthAudit.id,
                        baseItemId: baseItemId
                    }
                });

                const existingEv = await prisma.evidenciaAutoauditoria.findFirst({
                    where: {
                        autoauditoriaItemId: nextMonthItem.id,
                        url: webViewLink
                    }
                });

                if (!existingEv) {
                    await prisma.evidenciaAutoauditoria.create({
                        data: {
                            autoauditoriaItemId: nextMonthItem.id,
                            url: webViewLink,
                            name: fileId
                        }
                    });
                }
            }
        }

        res.json({ success: true, url: webViewLink, evidencia });

        // Notifica clientes que houve upload de evidencia
        notifyDataChange('autoauditoria_updated', { unidade, mesAno });
        if (nextMonthAudit) {
            notifyDataChange('autoauditoria_updated', { unidade, mesAno: nextMonthStr });
        }

    } catch (error: any) {
        console.error('[Drive Upload] Error:', error);
        res.status(500).json({ error: 'Falha no upload para o Drive', details: error?.message });
    }
});

// Novo Endpoint para Salvar Link Manual
app.post('/api/autoauditoria/evidencia/link', async (req: any, res: any) => {
    try {
        const { unidade, mesAno, baseItemId, url, tipo = 'AUTO' } = req.body;

        if (!unidade || !mesAno || !baseItemId || !url) {
            return res.status(400).json({ error: 'Faltam dados essenciais para salvar o link.' });
        }

        console.log(`[Link Manual] Salvando link para: ${mesAno} > CD ${unidade} > Item ${baseItemId} (${tipo})`);

        // 1. Garantir que a autoauditoria pai existe
        const autoauditoria = await prisma.autoauditoria.upsert({
            where: {
                unidade_mesAno_tipo: { unidade, mesAno, tipo }
            },
            update: {},
            create: {
                unidade,
                mesAno,
                tipo,
                status: 'Pendente de Auditoria'
            }
        });

        // 2. Upsert do Item que vai levar a evidencia (tabela pai da evidencia)
        const autoauditoriaItem = await prisma.autoauditoriaItem.upsert({
            where: {
                autoauditoriaId_baseItemId: {
                    autoauditoriaId: autoauditoria.id,
                    baseItemId: baseItemId
                }
            },
            update: {},
            create: {
                autoauditoriaId: autoauditoria.id,
                baseItemId: baseItemId
            }
        });

        // 3. Limpeza de evidência de LINK anterior desabilitada para permitir múltiplos links
        // await prisma.evidenciaAutoauditoria.deleteMany({
        //     where: {
        //         autoauditoriaItemId: autoauditoriaItem.id,
        //         name: 'Manual Link'
        //     }
        // });

        // 4. Finalmente, cria a evidencia apontando a url
        const evidencia = await prisma.evidenciaAutoauditoria.create({
            data: {
                autoauditoriaItemId: autoauditoriaItem.id,
                url: url,
                name: 'Manual Link', // Identificador para saber que não é do Drive
            }
        });

        // Replicação para o próximo mês (caso esteja aberto)
        const currentRealMonth = getCurrentRealWorldMonth();
        const isCurrentMonth = mesAno === currentRealMonth;
        const nextMonthStr = getNextMonthStr(mesAno);
        let nextMonthAudit = null;

        if (isCurrentMonth && nextMonthStr) {
            nextMonthAudit = await prisma.autoauditoria.findUnique({
                where: {
                    unidade_mesAno_tipo: { unidade, mesAno: nextMonthStr, tipo }
                }
            });
            if (nextMonthAudit) {
                const nextMonthItem = await prisma.autoauditoriaItem.upsert({
                    where: {
                        autoauditoriaId_baseItemId: {
                            autoauditoriaId: nextMonthAudit.id,
                            baseItemId: baseItemId
                        }
                    },
                    update: {},
                    create: {
                        autoauditoriaId: nextMonthAudit.id,
                        baseItemId: baseItemId
                    }
                });

                const existingEv = await prisma.evidenciaAutoauditoria.findFirst({
                    where: {
                        autoauditoriaItemId: nextMonthItem.id,
                        url: url
                    }
                });

                if (!existingEv) {
                    await prisma.evidenciaAutoauditoria.create({
                        data: {
                            autoauditoriaItemId: nextMonthItem.id,
                            url: url,
                            name: 'Manual Link'
                        }
                    });
                }
            }
        }

        res.json({ success: true, url, evidencia });

        // Notifica clientes que houve mudança nos dados
        notifyDataChange('autoauditoria_updated', { unidade, mesAno });
        if (nextMonthAudit) {
            notifyDataChange('autoauditoria_updated', { unidade, mesAno: nextMonthStr });
        }

    } catch (error: any) {
        console.error('[Link Manual] Error:', error);
        res.status(500).json({ error: 'Falha ao salvar link manual', details: error?.message });
    }
});

// Novo Endpoint para Deletar Evidência (Drive ou Link Manual) com deleção física no Drive
app.delete('/api/autoauditoria/evidencia/:id', async (req: any, res: any) => {
    try {
        const { id } = req.params;

        // 1. Busca a evidência no banco
        const evidencia = await prisma.evidenciaAutoauditoria.findUnique({
            where: { id },
            include: {
                autoauditoriaItem: {
                    include: {
                        autoauditoria: true
                    }
                }
            }
        });

        if (!evidencia) {
            return res.status(404).json({ error: 'Evidência não encontrada.' });
        }

        // 2. Se for arquivo do Drive, tenta deletar do Drive também
        if (evidencia.name !== 'Manual Link') {
            try {
                await googleDriveService.deleteFile(evidencia.name);
                console.log(`[Drive Delete] Arquivo ${evidencia.name} removido do Drive.`);
            } catch (driveErr: any) {
                console.warn(`[Drive Delete] Alerta: Não foi possível deletar do Drive:`, driveErr.message);
            }
        }

        // Replicação da deleção para o próximo mês (caso esteja aberto)
        let nextMonthAudit = null;
        let nextMonthStr = '';
        if (evidencia.autoauditoriaItem?.autoauditoria) {
            const { unidade, mesAno, tipo } = evidencia.autoauditoriaItem.autoauditoria;
            const { baseItemId } = evidencia.autoauditoriaItem;
            
            const currentRealMonth = getCurrentRealWorldMonth();
            const isCurrentMonth = mesAno === currentRealMonth;
            nextMonthStr = getNextMonthStr(mesAno);

            if (isCurrentMonth && nextMonthStr) {
                nextMonthAudit = await prisma.autoauditoria.findUnique({
                    where: {
                        unidade_mesAno_tipo: { unidade, mesAno: nextMonthStr, tipo }
                    },
                    include: {
                        items: {
                            where: { baseItemId }
                        }
                    }
                });

                if (nextMonthAudit && nextMonthAudit.items.length > 0) {
                    const nextMonthItem = nextMonthAudit.items[0];
                    const nextMonthEv = await prisma.evidenciaAutoauditoria.findFirst({
                        where: {
                            autoauditoriaItemId: nextMonthItem.id,
                            url: evidencia.url
                        }
                    });
                    if (nextMonthEv) {
                        await prisma.evidenciaAutoauditoria.delete({
                            where: { id: nextMonthEv.id }
                        });
                    }
                }
            }
        }

        // 3. Deleta do banco de dados
        await prisma.evidenciaAutoauditoria.delete({
            where: { id }
        });

        res.json({ success: true });

        // Notifica clientes que houve mudança nos dados
        if (evidencia.autoauditoriaItem?.autoauditoria) {
            const { unidade, mesAno } = evidencia.autoauditoriaItem.autoauditoria;
            notifyDataChange('autoauditoria_updated', { unidade, mesAno });
            if (nextMonthAudit) {
                notifyDataChange('autoauditoria_updated', { unidade, mesAno: nextMonthStr });
            }
        }

    } catch (error: any) {
        console.error('[Delete Evidencia] Error:', error);
        res.status(500).json({ error: 'Falha ao deletar evidência', details: error?.message });
    }
});

// AI endpoints
app.post('/api/ai/suggest-action', async (req, res) => {
    try {
        const { pilar, bloco, item, descricao } = req.body;
        if (!pilar || !item) {
            return res.status(400).json({ error: 'Dados insuficientes para sugestão.' });
        }
        const suggestion = await aiService.suggestAction(pilar, bloco, item, descricao);
        res.json({ suggestion });
    } catch (error: any) {
        console.error('[AI API] Error:', error);
        res.status(500).json({ error: error.message || 'Erro ao processar sugestão de IA' });
    }
});

app.post('/api/ai/analyze-evidence', async (req, res) => {
    try {
        const { pilar, bloco, item, descricao, evidenceId } = req.body;
        if (!evidenceId) {
            return res.status(400).json({ error: 'ID da evidência é necessário.' });
        }

        // 1. Buscar a evidência no banco para pegar o fileId se necessário, 
        // ou assumir que evidenceId já é o ID do arquivo no Google Drive.
        // Pelo esquema atual, a URL contém o ID. Mas vamos passar o ID direto do frontend para simplificar.

        // 2. Baixar o arquivo do Drive
        const { buffer, mimeType } = await googleDriveService.downloadFile(evidenceId);

        // 3. Analisar com Gemini Vision
        const analysis = await aiService.analyzeEvidence(pilar, bloco, item, descricao, buffer, mimeType);

        res.json({ analysis });
    } catch (error: any) {
        console.error('[AI Vision API] Error:', error);
        res.status(500).json({ error: error.message || 'Erro ao processar análise visual' });
    }
});

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running with Socket.io on port ${PORT}`);
});
