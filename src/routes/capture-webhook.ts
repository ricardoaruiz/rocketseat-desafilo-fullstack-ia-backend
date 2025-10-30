import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { StatusCodes } from 'http-status-codes'
import z from 'zod/v4'
import { db } from '@/db'
import { webhooks } from '@/db/schema/webhooks'

const CAPTURE_WEB_HOOK_SUCCESS_RESPONSE_SCHEMA = z.object({
  id: z.uuidv7(),
})

export const captureWebHooks: FastifyPluginAsyncZod = async (app) => {
  app.all(
    '/capture/*',
    {
      schema: {
        summary: 'Capture incoming webhook requests',
        description: 'Capture incoming webhook requests',
        tags: ['External'],
        hide: true, //remove da documentação
        response: {
          [StatusCodes.CREATED]: CAPTURE_WEB_HOOK_SUCCESS_RESPONSE_SCHEMA,
        },
      },
    },
    async (request, reply) => {
      const method = request.method
      const ip = request.ip
      const statusCode = StatusCodes.OK
      const contentType = request.headers['content-type']
      const contentLength = request.headers['content-length']
        ? Number(request.headers['content-length'])
        : null
      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : (value ?? ''),
        ]),
      )

      let body: string | null = null
      if (request.body) {
        body =
          typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body)
      }

      const pathname = new URL(request.url).pathname.replace('/capture', '')

      const result = await db
        .insert(webhooks)
        .values({
          method,
          ip,
          statusCode,
          contentType,
          contentLength,
          headers,
          body,
          pathname,
        })
        .returning()

      reply.status(StatusCodes.CREATED).send({ id: result[0].id })
    },
  )
}
