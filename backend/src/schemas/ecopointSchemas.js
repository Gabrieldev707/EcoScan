const { z } = require('zod');

const nearbyEcoPointsQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().positive().max(50).default(5),
  })
  .strict();

module.exports = { nearbyEcoPointsQuerySchema };
