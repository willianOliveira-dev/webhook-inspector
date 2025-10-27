import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '@/env'
import ScalarApiReference from '@scalar/fastify-api-reference'

const app = fastify().withTypeProvider<ZodTypeProvider>()
const port: number = env.PORT || 3333

app.setValidatorCompiler(validatorCompiler)

app.setSerializerCompiler(serializerCompiler)

// Configurar plugins
app.register(fastifyCors, {
  origin: true, // Qualquer endereço acesse o nosso backend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentials
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for capturing and inspecting webhook requests.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`🔥 HTTP server running on http://localhost:${port}`)
  console.log(`📚 Docs available at http://localhost:${port}/docs`)
})
