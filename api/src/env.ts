import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.coerce.number().default(10000),
    DATABASE_URL: z.url(),
    GROQ_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
