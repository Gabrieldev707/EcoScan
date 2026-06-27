const { classificationResultSchema } = require('../schemas/classificationSchema');

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const CLASSIFICATIONS = [
  {
    category: 'Vidro',
    binColor: 'Verde',
    canRecycle: true,
    points: 10,
    confidence: 0.72,
    keywords: ['vidro', 'garrafa de vidro', 'frasco', 'pote de conserva'],
    disposalGuide: 'Embale vidro quebrado com seguranca e descarte na lixeira verde.',
  },
  {
    category: 'Plástico',
    binColor: 'Vermelho',
    canRecycle: true,
    points: 12,
    confidence: 0.78,
    keywords: ['pet', 'plastico', 'garrafa', 'sacola', 'embalagem', 'pote'],
    disposalGuide: 'Esvazie, amasse e descarte na lixeira vermelha.',
  },
  {
    category: 'Papel',
    binColor: 'Azul',
    canRecycle: true,
    points: 8,
    confidence: 0.76,
    keywords: ['papel', 'papelao', 'jornal', 'revista', 'caixa'],
    disposalGuide: 'Mantenha seco, dobre caixas e descarte na lixeira azul.',
  },
  {
    category: 'Metal',
    binColor: 'Amarelo',
    canRecycle: true,
    points: 14,
    confidence: 0.76,
    keywords: ['metal', 'lata', 'aluminio', 'aco', 'tampinha', 'ferragem'],
    disposalGuide: 'Esvazie, amasse quando possivel e descarte na lixeira amarela.',
  },
  {
    category: 'Orgânico',
    binColor: 'Marrom',
    canRecycle: false,
    points: 4,
    confidence: 0.7,
    keywords: ['organico', 'comida', 'resto', 'casca', 'folha', 'fruta'],
    disposalGuide: 'Separe para compostagem quando disponivel ou descarte como organico.',
  },
];

const DEFAULT_CLASSIFICATION = {
  category: 'Rejeito',
  binColor: 'Cinza',
  canRecycle: false,
  points: 2,
  confidence: 0.45,
  disposalGuide: 'Descarte na lixeira cinza e evite misturar com reciclaveis limpos.',
};

function classifyWaste(input) {
  const wasteType = input.wasteType.trim();
  const normalized = normalize(wasteType);
  const match = CLASSIFICATIONS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );
  const { keywords, ...classification } = match || DEFAULT_CLASSIFICATION;

  return {
    ...classificationResultSchema.parse({
      wasteType,
      ...classification,
    }),
    source: 'fallback',
  };
}

module.exports = { classifyWaste };
