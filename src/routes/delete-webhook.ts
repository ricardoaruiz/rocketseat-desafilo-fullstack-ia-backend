import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { StatusCodes } from "http-status-codes";
import z4 from "zod/v4";

const DELETE_WEBHOOK_PARAMS_SCHEMA = z4.object({
  id: z4.uuidv7().describe('The unique identifier of the webhook to be deleted'),
});
const DELETE_WEBHOOK_NOT_FOUND_RESPONSE_SCHEMA = z4.object({
  message: z4.string().describe('Error message indicating that the webhook was not found'),
});

export const deleteWebhookRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete('/api/webhooks/:id', {
    schema: {
      summary: 'Delete a webhook',
      description: 'Deletes a webhook by its ID.',
      tags: ['Webhooks'],
      params: DELETE_WEBHOOK_PARAMS_SCHEMA,
      response: {
        [StatusCodes.NO_CONTENT]: z4.void(),
        [StatusCodes.NOT_FOUND]: DELETE_WEBHOOK_NOT_FOUND_RESPONSE_SCHEMA,
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;

    const response = await db.delete(webhooks).where(eq(webhooks.id, id)).returning();
    
    if (!response.length) {
      return reply.status(StatusCodes.NOT_FOUND).send({
        message: `Webhook with ID ${id} not found.`,
      });
    }

    return reply.status(StatusCodes.NO_CONTENT).send();
    
  })
}
  