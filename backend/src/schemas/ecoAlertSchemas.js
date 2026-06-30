const { z } = require('zod');

const ALERT_TYPES = [
  'illegal_dumping',
  'overflowing_bin',
  'street_litter',
  'hazardous_waste',
  'blocked_drain',
  'other',
];

const SEVERITIES = ['low', 'medium', 'high'];
const STATUSES = ['received', 'under_review', 'forwarded', 'resolved', 'rejected'];

const ecoAlertImageSchema = z
  .object({
    base64: z.string().trim().min(100).max(3_500_000),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  })
  .strict();

const createEcoAlertSchema = z
  .object({
    city: z.string().trim().min(2).max(120),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    note: z.string().trim().max(500).optional(),
    image: ecoAlertImageSchema,
  })
  .strict();

const listEcoAlertsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(STATUSES).optional(),
  })
  .strict();

const ecoAlertAnalysisSchema = z
  .object({
    isActionable: z.boolean(),
    type: z.enum(ALERT_TYPES),
    severity: z.enum(SEVERITIES),
    summary: z.string().trim().min(10).max(700),
    detectedItems: z.array(z.string().trim().min(2).max(80)).max(12).default([]),
    risks: z.array(z.string().trim().min(2).max(120)).max(8).default([]),
    recommendedAction: z.string().trim().min(10).max(700),
    confidence: z.number().min(0).max(1),
  })
  .strict();

module.exports = {
  ALERT_TYPES,
  SEVERITIES,
  STATUSES,
  createEcoAlertSchema,
  ecoAlertAnalysisSchema,
  listEcoAlertsQuerySchema,
};
