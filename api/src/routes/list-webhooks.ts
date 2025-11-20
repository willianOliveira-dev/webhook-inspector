import { webhooks } from '@prisma/client';
import { z } from 'zod';
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const webhookSelectedSchema: z.ZodType<
    Pick<webhooks, 'id' | 'method' | 'pathname' | 'createdAt'>
> = z.object({
    id: z.uuidv7(),
    method: z.string(),
    pathname: z.string(),
    createdAt: z.date(),
});

export const listWebooks: FastifyPluginAsyncZod = async (app) => {
    app.get(
        '/api/v1/webhooks',
        {
            schema: {
                summary: 'Listar webhooks',
                tags: ['Webhooks'],
                querystring: z.object({
                    limit: z.coerce.number().min(1).max(100).default(20),
                    cursor: z.coerce.date().optional(),
                }),
                response: {
                    200: z.object({
                        webhooks: z.array(webhookSelectedSchema),
                        nextCursor: z.coerce.date().nullable(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { limit, cursor } = request.query;

            const result = await app.prisma.webhooks.findMany({
                select: {
                    id: true,
                    pathname: true,
                    method: true,
                    createdAt: true,
                },
                take: limit + 1, // + 1 => serve para verificar se há mais um último webhook disponível.
                orderBy: [
                    {
                        createdAt: 'desc',
                    },
                ],
                where: {
                    createdAt: {
                        lt: cursor ? cursor : undefined,
                    },
                },
            });
            const hasMore = result.length > limit;
            const items = hasMore ? result.slice(0, limit) : result;
            const nextCursor = hasMore
                ? items[items.length - 1].createdAt
                : null;

            return reply.send({
                webhooks: items,
                nextCursor,
            });
        }
    );
};
