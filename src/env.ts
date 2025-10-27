import { z } from 'zod'

const ENV_SCHEMA = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
})

export const env = ENV_SCHEMA.parse(process.env)
