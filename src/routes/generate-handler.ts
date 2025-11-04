import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
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

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `
          You will receive one or more example JSON payloads that represent the body of webhook requests from a third-party service.
          Based on these examples, generate a TypeScript webhook handler that:

          Uses Zod to define a type-safe schema for each possible event type found in the examples.

          Exports a single async function (e.g. handleWebhook) that:

          Accepts an object representing the parsed webhook ${webhooksBody}.

          Validates it against the appropriate Zod schema.

          Handles each event type with a dedicated conditional or switch-case branch.

          Includes TypeScript types inferred from Zod.

          The handler should log or comment what each event handling branch would do (you don’t need to implement real business logic).

          If an unknown event type is received, the handler should throw a descriptive error.

          Return only the code and do not return \`\`\`typescript or any other markdown symbols, do not include any explanations or extra text.
          Input: one or more JSON webhook body examples.
          Output: TypeScript code implementing the Zod schemas and the handleWebhook function.
        `,
      })

      return reply.status(StatusCodes.CREATED).send({
        code: text,
      })
    },
  )
}
