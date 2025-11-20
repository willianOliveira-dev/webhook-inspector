import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
    app.all(
        '/capture/*',
        {
            schema: {
                summary: 'Capturar solicitação de webhook recebida',
                tags: ['External'],
                hide: true,
                response: {
                    201: z.object({
                        id: z.uuidv7(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { method } = request;
            const { ip } = request;
            const contentType = request.headers['content-type'];
            const contentLength = request.headers['content-length']
                ? Number(request.headers['content-length'])
                : null;

            let body: string | null = null;

            if (request.body) {
                body =
                    typeof request.body === 'string'
                        ? request.body
                        : JSON.stringify(request.body, null, 2);
            }

            const pathname = new URL(request.url).pathname.replace(
                '/capture',
                ''
            );

            const headers = Object.fromEntries(
                Object.entries(request.headers).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value.join(', ') : value,
                ])
            );

            const result = await app.prisma.webhooks.create({
                data: {
                    id: uuidv7(),
                    method,
                    pathname,
                    ip,
                    contentLength,
                    contentType,
                    headers,
                    body,
                },
            });

            return reply.status(201).send({ id: result.id });
        }
    );
};
