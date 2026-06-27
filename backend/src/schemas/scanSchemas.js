const { z } = require('zod');

const createScanSchema = z
  .object({
    wasteType: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
  })
  .strict();

const listScansQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

module.exports = { createScanSchema, listScansQuerySchema };
