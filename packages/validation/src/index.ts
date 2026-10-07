import { z } from 'zod';

export const phoneNumberSchema = z.string().trim().regex(/^\+[1-9]\d{6,14}$/);
export const idempotencyKeySchema = z.string().uuid();
export const coordinatesSchema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

