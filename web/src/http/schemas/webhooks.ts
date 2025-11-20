import { z } from 'zod';

export const webookListItemSchema = z.object({
    id: z.uuidv7(),
    method: z.string(),
    pathname: z.string(),
    createdAt: z.coerce.date(),
});

export const webhookListSchema = z.object({
    webhooks: z.array(webookListItemSchema),
    nextCursor: z.string().nullable(),
});

export const webhookDetailsSchema = z.object({
    id: z.uuidv7(),
    method: z.string(),
    pathname: z.string(),
    ip: z.string(),
    statusCode: z.number(),
    contentType: z.string().nullable(),
    contentLength: z.number().nullable(),
    queryParams: z.record(z.string(), z.string()).nullable(),
    headers: z.record(z.string(), z.string()),
    body: z.string().nullable(),
    createdAt: z.coerce.date(),
});
