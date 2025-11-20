import { webhooks } from '@prisma/client';
import { z } from 'zod';

export const webhookSchema: z.ZodType<webhooks> = z.object({
    id: z.uuidv7(), // -> Time sortable
    method: z.string(),
    pathname: z.string(),
    ip: z.string(),
    statusCode: z.number(),
    contentType: z.string().nullable(),
    contentLength: z.number().nullable(),
    queryParams: z.any().nullable(),
    headers: z.any(),
    body: z.string(),
    createdAt: z.date(),
});

export const webhooksSchema = z.array(webhookSchema);
