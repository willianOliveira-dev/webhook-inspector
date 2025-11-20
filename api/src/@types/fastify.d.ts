import 'fastify';
import { PrismaClient } from '@prisma/client';
/*
Esse código diz pro TypeScript que toda instância do Fastify (app, server, etc.)
agora tem uma propriedade prisma do tipo PrismaClient.
*/
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
