import { z } from 'zod';

export const priceCheckSchema = z.object({
  productCode: z.string().min(1),
  marketCode: z.string().min(1),
  quotedPrice: z.number().positive(),
  unitCode: z.string().min(1),
});

export const priceReportSchema = z
  .object({
    productCode: z.string().optional(),
    rawProductName: z.string().optional(),
    marketCode: z.string().min(1),
    submittedPrice: z.number().positive(),
    submittedUnit: z.string().min(1),
  })
  .refine((value) => Boolean(value.productCode || value.rawProductName), {
    message: 'Select a product or enter a product name.',
  });
