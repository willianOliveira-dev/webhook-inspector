import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { generateText } from 'ai';
import { z } from 'zod';
import { prompt } from '../helpers/prompt';
import { google } from '@ai-sdk/google';

export const generateWebhook: FastifyPluginAsyncZod = async (app) => {
    app.post(
        '/api/v1/generate',
        {
            schema: {
                summary: 'Gera um TypeScript handler',
                tags: ['Webhooks'],
                body: z.object({
                    webhookIds: z.array(z.string()),
                }),
                response: {
                    201: z.object({
                        code: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { webhookIds } = request.body;

            const result = await app.prisma.webhooks.findMany({
                select: {
                    body: true,
                },
                where: {
                    id: {
                        in: webhookIds,
                    },
                },
            });

            const webhookBodies = result
                .map((webhook) => webhook.body)
                .join('\n\n');

            const { text } = await generateText({
                model: google('gemini-2.5-flash'),
                prompt: prompt(webhookBodies),
            });

            return reply.status(201).send({ code: text });
        }
    );
};
