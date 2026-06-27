const { z } = require('zod');

const CATEGORIES = ['Plástico', 'Papel', 'Metal', 'Vidro', 'Orgânico', 'Rejeito'];

const BIN_COLOR_BY_CATEGORY = {
  Plástico: 'Vermelho',
  Papel: 'Azul',
  Metal: 'Amarelo',
  Vidro: 'Verde',
  Orgânico: 'Marrom',
  Rejeito: 'Cinza',
};

const CAN_RECYCLE_BY_CATEGORY = {
  Plástico: true,
  Papel: true,
  Metal: true,
  Vidro: true,
  Orgânico: false,
  Rejeito: false,
};

const classificationResultSchema = z
  .object({
    wasteType: z.string().trim().min(2).max(120),
    category: z.enum(CATEGORIES),
    binColor: z.enum(['Vermelho', 'Azul', 'Amarelo', 'Verde', 'Marrom', 'Cinza']),
    canRecycle: z.boolean(),
    points: z.number().int().min(0).max(100),
    disposalGuide: z.string().trim().min(10).max(500),
    confidence: z.number().min(0).max(1),
  })
  .strict()
  .refine((value) => BIN_COLOR_BY_CATEGORY[value.category] === value.binColor, {
    message: 'binColor does not match category',
    path: ['binColor'],
  })
  .refine((value) => CAN_RECYCLE_BY_CATEGORY[value.category] === value.canRecycle, {
    message: 'canRecycle does not match category',
    path: ['canRecycle'],
  });

module.exports = {
  BIN_COLOR_BY_CATEGORY,
  CAN_RECYCLE_BY_CATEGORY,
  CATEGORIES,
  classificationResultSchema,
};
