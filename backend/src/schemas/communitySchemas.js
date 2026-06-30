const { z } = require('zod');

const communityOverviewQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(30).default(10),
  })
  .strict();

module.exports = { communityOverviewQuerySchema };
