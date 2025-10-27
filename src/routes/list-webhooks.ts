import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

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
          [StatusCodes.OK]: z.object({
            webhooks: z.array(
              z.object({
                id: z.string(),
                method: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (_request, reply) => {
      return reply.send({
        webhooks: [
          { id: 'wh_1', method: 'POST' },
          { id: 'wh_2', method: 'GET' },
        ],
      })
    },
  )
}
