import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { generateText } from 'ai';
import { z } from 'zod';
import { prompt } from '../helpers/prompt';
import { groq } from '@ai-sdk/groq';

const generatedHandlerSchema = z.object({
    code: z.string().min(1),
});

function removeMarkdownCodeFence(code: string) {
    const trimmedCode = code.trim();
    const fencedCodeMatch = trimmedCode.match(
        /^```(?:typescript|ts)?\s*([\s\S]*?)\s*```$/i
    );

    if (fencedCodeMatch) {
        return fencedCodeMatch[1].trim();
    }

    return trimmedCode
        .replace(/^```(?:typescript|ts)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

export const generateWebhook: FastifyPluginAsyncZod = async (app) => {
    app.post(
        '/api/v1/generate',
        {
            schema: {
                summary: 'Gera um TypeScript handler',
                tags: ['Webhooks'],
                body: z.object({
                    webhookIds: z.array(z.uuidv7()).min(1).max(20),
                }),
                response: {
                    201: generatedHandlerSchema,
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
                model: groq('llama-3.3-70b-versatile'),
                prompt: prompt(webhookBodies),
            });

            return reply.status(201).send({
                code: removeMarkdownCodeFence(text),
            });
        },
    );
};
