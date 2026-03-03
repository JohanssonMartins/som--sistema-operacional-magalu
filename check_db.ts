import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(u => {
    console.log("Users in DB:", u.length);
    if (u.length > 0) {
        console.log("First user:", u[0].email, "Password:", u[0].password);
        const admin = u.find(x => x.email === 'admin@magalu.com');
        console.log("Admin:", admin ? admin.password : "NOT FOUND");
    }
    prisma.$disconnect();
});
