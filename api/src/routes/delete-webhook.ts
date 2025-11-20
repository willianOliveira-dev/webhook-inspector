import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { webhookSchema } from '@/schemas/zod/webhooks';
import { z } from 'zod';

export const deleteWebhook: FastifyPluginAsyncZod = async (app) => {
    app.delete(
        '/api/v1/webhooks/:id',
        {
            schema: {
                summary: 'Remover um webhook específico por ID',
                tags: ['Webhooks'],
                params: z.object({
                    id: z.uuidv7(),
                }),
                response: {
                    204: z.void(),
                    404: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            const result = await app.prisma.webhooks.delete({
                where: {
                    id,
                },
            });

            if (!result) {
                return reply
                    .status(404)
                    .send({ message: 'Webhook not found.' });
            }

            return reply.status(204).send();
        }
    );
};
