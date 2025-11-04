import { inArray } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z4, { z } from 'zod/v4'
import { db } from '@/db'
import { webhooks } from '@/db/schema'

const GENERATE_HANDLER_BODY_SCHEMA = z4.object({
  ids: z4
    .array(z.uuidv7())
    .describe('Array of prompt IDs to generate content from'),
})

const GENERATE_HANDLER_RESPONSE_SUCCESS_SCHEMA = z4.object({
  code: z4.string().describe('Code of generated Typescript handler'),
})

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/handlers',
    {
      schema: {
        summary: 'Generate a handler',
        description:
          'Generates a Typescript handler using the provided Webhook IDs.',
        tags: ['Handlers'],
        body: GENERATE_HANDLER_BODY_SCHEMA,
        response: {
          [StatusCodes.CREATED]: GENERATE_HANDLER_RESPONSE_SUCCESS_SCHEMA,
        },
      },
    },
    async (request, reply) => {
      const { ids } = request.body

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, ids))

      const webhooksBody = result.map((item) => item.body).join('\n\n')

      return reply.status(StatusCodes.CREATED).send({
        code: webhooksBody,
      })
    },
  )
}
