import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default fp(async (app) => {
    // Adiciona (decorates) o Prisma dentro do Fastify
    app.decorate('prisma', prisma);

    // Encerra a conexão ao finalizar o servidor
    app.addHook('onClose', async (app) => {
        await app.prisma.$disconnect();
    });
});
