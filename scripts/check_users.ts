import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany();
    console.log('Users in DB:');
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}): active=${u.active}`);
    });

    // If any are not active, update them
    const inactiveCount = users.filter(u => !u.active).length;
    if (inactiveCount > 0) {
        console.log(`Updating ${inactiveCount} inactive users to active...`);
        await prisma.user.updateMany({
            where: { active: { not: true } },
            data: { active: true }
        });
        console.log('Update complete.');
    }

    await prisma.$disconnect();
}

checkUsers();
