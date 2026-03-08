import { PrismaClient } from '@prisma/client';
import { MOCK_USERS, INITIAL_CHECKLIST } from '../src/data';

const prisma = new PrismaClient({});

async function main() {
    console.log('Seeding database...');

    // 1. Seed Users
    for (const user of MOCK_USERS) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                unidade: user.unidade,
                password: user.password,
                photo: user.photo,
            },
        });
    }
    console.log('Users seeded');

    // 2. Seed Base Items
    for (const item of INITIAL_CHECKLIST) {
        await prisma.baseChecklistItem.create({
            data: {
                id: item.id,
                code: item.code,
                pilar: item.pilar,
                bloco: item.bloco,
                trilha: item.trilha,
                item: item.item,
                descricao: item.descricao,
                exigeEvidencia: item.exigeEvidencia,
                ativo: item.ativo,
                order: item.order,
            }
        });
    }
    console.log('Base Checklist Items seeded');

    // 3. Seed generated items for units
    const units = Array.from(new Set(MOCK_USERS.map((u) => u.unidade))).filter(
        (u) => u !== 'Master'
    );

    const initialGeneratedItems = units.flatMap((unit) =>
        INITIAL_CHECKLIST.map((item) => ({
            ...item,
            id: `${unit}-${item.id}`,
            unidade: unit,
            assigneeId: '',
        }))
    );

    for (const genItem of initialGeneratedItems) {
        await prisma.checklistItem.create({
            data: {
                id: genItem.id,
                code: genItem.code,
                pilar: genItem.pilar,
                bloco: genItem.bloco,
                trilha: genItem.trilha,
                item: genItem.item,
                descricao: genItem.descricao,
                exigeEvidencia: genItem.exigeEvidencia,
                ativo: genItem.ativo,
                order: genItem.order,
                unidade: genItem.unidade,
                assigneeId: genItem.assigneeId !== '' ? genItem.assigneeId : null,
            }
        });
    }

    console.log('Generated Items per Unit seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
