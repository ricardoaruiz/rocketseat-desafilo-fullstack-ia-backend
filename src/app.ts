import cors from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { captureWebHooks } from './routes/capture-webhook'
import { deleteWebhookRoute } from './routes/delete-webhook'
import { generateHandler } from './routes/generate-handler'
import { getWebHook } from './routes/get-webhook'
import { listWebhooks } from './routes/list-webhooks'

// Zod Type Provider
const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// CORS
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // credentials: true,
})

// Swagger API Documentation
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API documentation for the Webhook Inspector service',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

// Scalar API Reference Documentation
app.register(scalarApiReference, {
  routePrefix: '/docs',
})

// Routes
app.register(getWebHook)
app.register(listWebhooks)
app.register(deleteWebhookRoute)
app.register(captureWebHooks)
app.register(generateHandler)

export { app }
