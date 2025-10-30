import { desc, lt } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod/v4'

import { db } from '@/db'
import { webhooks } from '@/db/schema'

const LIST_WEBHOOKS_QUERY_SCHEMA = z.object({
  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum number of webhooks to return'),
  cursor: z.uuidv7().optional().describe('Cursor for pagination'),
})

const LIST_WEBHOOKS_SUCCESS_RESPONSE_SCHEMA = z.object({
  webhooks: z.array(
    createSelectSchema(webhooks).pick({
      id: true,
      method: true,
      pathname: true,
      createdAt: true,
    }),
  ),
  nextCursor: z.uuidv7().nullable().describe('Cursor for next page').optional(),
})

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List Webhooks',
        description: 'Retrieve a list of all registered webhooks',
        tags: ['Webhooks'],
        querystring: LIST_WEBHOOKS_QUERY_SCHEMA,
        response: {
          [StatusCodes.OK]: LIST_WEBHOOKS_SUCCESS_RESPONSE_SCHEMA,
        },
      },
    },
    async (_request, reply) => {
      const { limit, cursor } = _request.query

      const result = await db
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)
        .where(cursor ? lt(webhooks.id, cursor) : undefined)
        .orderBy(desc(webhooks.id))
        .limit(limit + 1)

      const hasMore = result.length > limit
      const items = hasMore ? result.slice(0, limit) : result
      const nextCursor = hasMore ? items[items.length - 1].id : null

      return reply.send({
        webhooks: items,
        nextCursor,
      })
    },
  )
}
