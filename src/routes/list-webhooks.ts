import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod/v4'
import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { createSelectSchema } from 'drizzle-zod'

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List Webhooks',
        description: 'Retrieve a list of all registered webhooks',
        tags: ['Webhooks'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).optional().default(20),
        }),
        response: {
          [StatusCodes.OK]: createSelectSchema(webhooks).array(),
        },
      },
    },
    async (_request, reply) => {
      const webhooksList = await db.select().from(webhooks)

      return reply.send(webhooksList)
    },
  )
}
