import { fastifyCors } from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { fastifySwagger } from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { fastify } from 'fastify';
import path from 'node:path';
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env';
import PrismaPlugin from './plugins/prisma';
import { captureWebhook } from './routes/capture-webhook';
import { deleteWebhook } from './routes/delete-webhook';
import { generateWebhook } from './routes/generate-handler';
import { getWebhook } from './routes/get-webhook';
import { listWebooks } from './routes/list-webhooks';

const app = fastify().withTypeProvider<ZodTypeProvider>();
const port: number = env.PORT;
const webDistPath = path.resolve(__dirname, '../../web/dist');

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
});

app.register(PrismaPlugin);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Webhook Inspector API',
            description:
                'API para capturar e inspecionar solicitacoes de webhook.',
            version: '1.0.0',
        },
    },
    transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
    routePrefix: '/docs',
});

app.register(getWebhook);
app.register(listWebooks);
app.register(deleteWebhook);
app.register(captureWebhook);
app.register(generateWebhook);

app.register(fastifyStatic, {
    root: webDistPath,
    prefix: '/',
});

app.setNotFoundHandler((request, reply) => {
    const url = request.raw.url ?? '';

    if (
        url.startsWith('/api/') ||
        url.startsWith('/capture') ||
        url.startsWith('/docs')
    ) {
        return reply.status(404).send({ message: 'Route not found.' });
    }

    return reply.sendFile('index.html');
});

app.listen({ port, host: '0.0.0.0' }).then(() => {
    console.log(`HTTP server running on http://0.0.0.0:${port}`);
    console.log(`Docs available at http://0.0.0.0:${port}/docs`);
});
