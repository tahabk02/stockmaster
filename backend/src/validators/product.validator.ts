import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});
