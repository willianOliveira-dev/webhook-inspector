import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { webhookSchema } from '@/schemas/zod/webhooks';
import { z } from 'zod';

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
    app.get(
        '/api/v1/webhooks/:id',
        {
            schema: {
                summary: 'Buscar um webhook específico por ID',
                tags: ['Webhooks'],
                params: z.object({
                    id: z.uuidv7(),
                }),
                response: {
                    200: webhookSchema,
                    404: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const result = await app.prisma.webhooks.findUnique({
                where: {
                    id,
                },
            });

            if (!result) {
                return reply
                    .status(404)
                    .send({ message: 'Webhook not found.' });
            }
            return reply.send(result);
        }
    );
};
