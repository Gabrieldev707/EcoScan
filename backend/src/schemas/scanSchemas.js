const { z } = require('zod');

const scanImageSchema = z
  .object({
    base64: z.string().trim().min(100).max(3_500_000),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  })
  .strict();

const createScanSchema = z
  .object({
    wasteType: z.string().trim().min(2).max(120).optional(),
    city: z.string().trim().min(2).max(120),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    image: scanImageSchema.optional(),
  })
  .strict()
  .refine((value) => Boolean(value.wasteType || value.image), {
    message: 'wasteType is required when no image is sent',
    path: ['wasteType'],
  })
  .refine((value) => (value.lat === undefined) === (value.lng === undefined), {
    message: 'lat and lng must be sent together',
    path: ['lng'],
  });

const listScansQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

module.exports = { createScanSchema, listScansQuerySchema };
