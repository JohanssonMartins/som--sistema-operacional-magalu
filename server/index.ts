import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({});
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Checklist Base Items
app.get('/api/base-items', async (req, res) => {
    try {
        const baseItems = await prisma.baseChecklistItem.findMany();
        res.json(baseItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar itens base' });
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
