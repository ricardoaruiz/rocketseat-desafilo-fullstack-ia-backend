import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { StatusCodes } from "http-status-codes";
import z from "zod/v4";

const GET_WEBHOOK_PARAMS_SCHEMA = z.object({
  id: z.uuidv7(),
});
const GET_WEB_HOOK_SUCCESS_RESPONSE_SCHEMA = createSelectSchema(webhooks);
const GET_WEB_HOOK_NOT_FOUND_RESPONSE_SCHEMA = z.object({
  message: z.string().default("Webhook not found"),
});

export const getWebHook: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/webhooks/:id', {
    schema: {
      summary: 'Get Webhook by ID',
      description: 'Retrieve a webhook by its unique ID',
      tags: ['Webhooks'],
      params: GET_WEBHOOK_PARAMS_SCHEMA,
      response: {
        [StatusCodes.OK]: GET_WEB_HOOK_SUCCESS_RESPONSE_SCHEMA,
        [StatusCodes.NOT_FOUND]: GET_WEB_HOOK_NOT_FOUND_RESPONSE_SCHEMA,
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    const result = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, id))
      .limit(1)

    if (!result.length) {
      return reply.status(StatusCodes.NOT_FOUND).send({ message: "Webhook not found" });
    }

    return reply.send(result[0])
  });
};