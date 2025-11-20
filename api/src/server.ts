import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastify } from 'fastify';
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '@/env';
import { getWebhook } from '@/routes/get-webhook';
import { listWebooks } from '@/routes/list-webhooks';
import PrismaPlugin from '@/plugins/prisma';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { deleteWebhook } from '@/routes/delete-webhook';
import { captureWebhook } from '@/routes/capture-webhook';
import { generateWebhook } from './routes/generate-handler';

const app = fastify().withTypeProvider<ZodTypeProvider>();
const port: number = env.PORT || 3333;

app.setValidatorCompiler(validatorCompiler);

app.setSerializerCompiler(serializerCompiler);

// Configurar plugins
app.register(fastifyCors, {
    origin: true, // Qualquer endereço acesse o nosso backend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // credentials
});

app.register(PrismaPlugin);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Webhook Inspector API',
            description:
                'API para capturar e inspecionar solicitações de webhook.',
            version: '1.0.0',
        },
    },
    transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
    routePrefix: '/docs',
});

// Rotas
app.register(getWebhook);
app.register(listWebooks);
app.register(deleteWebhook);
app.register(captureWebhook);
app.register(generateWebhook);

app.listen({ port, host: '0.0.0.0' }).then(() => {
    console.log(`🔥 HTTP server running on http://localhost:${port}`);
    console.log(`📚 Docs available at http://localhost:${port}/docs`);
});
