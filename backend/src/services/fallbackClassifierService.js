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
    material: 'vidro',
    keywords: ['vidro', 'garrafa de vidro', 'frasco', 'pote de conserva'],
    disposalGuide: 'Embale vidro quebrado com seguranca e descarte na lixeira verde.',
  },
  {
    category: 'Plástico',
    binColor: 'Vermelho',
    canRecycle: true,
    points: 12,
    confidence: 0.78,
    material: 'plastico',
    keywords: ['pet', 'plastico', 'garrafa', 'sacola', 'embalagem', 'pote'],
    disposalGuide: 'Esvazie, amasse e descarte na lixeira vermelha.',
  },
  {
    category: 'Papel',
    binColor: 'Azul',
    canRecycle: true,
    points: 8,
    confidence: 0.76,
    material: 'papel',
    keywords: ['papel', 'papelao', 'jornal', 'revista', 'caixa'],
    disposalGuide: 'Mantenha seco, dobre caixas e descarte na lixeira azul.',
  },
  {
    category: 'Metal',
    binColor: 'Amarelo',
    canRecycle: true,
    points: 14,
    confidence: 0.76,
    material: 'metal',
    keywords: ['metal', 'lata', 'aluminio', 'aco', 'tampinha', 'ferragem'],
    disposalGuide: 'Esvazie, amasse quando possivel e descarte na lixeira amarela.',
  },
  {
    category: 'Orgânico',
    binColor: 'Marrom',
    canRecycle: false,
    points: 4,
    confidence: 0.7,
    material: 'organico',
    keywords: ['organico', 'comida', 'resto', 'casca', 'folha', 'fruta'],
    disposalGuide: 'Separe para compostagem quando disponivel ou descarte como organico.',
  },
  {
    category: 'Rejeito',
    binColor: 'Cinza',
    canRecycle: false,
    points: 2,
    confidence: 0.52,
    material: 'misto ou contaminado',
    keywords: ['pipoca', 'papel higienico', 'guardanapo sujo', 'fralda', 'esponja', 'bituca'],
    disposalGuide: 'Descarte na lixeira cinza e evite misturar com reciclaveis limpos.',
  },
];

const DEFAULT_CLASSIFICATION = {
  category: 'Rejeito',
  binColor: 'Cinza',
  canRecycle: false,
  points: 0,
  confidence: 0.35,
  material: 'nao identificado',
  disposalGuide: 'Nao foi possivel confirmar o residuo. Revise a foto ou descreva melhor o item antes de pontuar.',
};

function looksLikeGarbageInput(value) {
  const normalized = normalize(value).replace(/[^a-z0-9 ]/g, '').trim();
  if (normalized.length < 2) return true;
  if (!/[aeiou]/.test(normalized)) return true;
  if (/^(.)\1{3,}$/.test(normalized.replace(/ /g, ''))) return true;
  return false;
}

function classifyWaste(input) {
  const wasteType = input.wasteType?.trim();

  if (!wasteType) {
    return {
      ...classificationResultSchema.parse({
        isValidWaste: false,
        wasteType: 'Residuo nao identificado',
        identifiedItem: 'Residuo nao identificado',
        material: 'nao identificado',
        ...DEFAULT_CLASSIFICATION,
        reason: 'A IA visual esta indisponivel no momento. Descreva o item ou tente novamente com a imagem.',
      }),
      source: 'fallback',
    };
  }
  const normalized = normalize(wasteType);
  const match = CLASSIFICATIONS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (!match && looksLikeGarbageInput(wasteType)) {
    return {
      ...classificationResultSchema.parse({
        isValidWaste: false,
        wasteType,
        identifiedItem: wasteType,
        material: 'nao identificado',
        ...DEFAULT_CLASSIFICATION,
        reason: 'A descricao nao parece corresponder a um residuo real.',
      }),
      source: 'fallback',
    };
  }

  const { keywords, ...classification } = match || DEFAULT_CLASSIFICATION;

  return {
    ...classificationResultSchema.parse({
      isValidWaste: Boolean(match),
      wasteType,
      identifiedItem: wasteType,
      reason: match
        ? 'Classificacao local por palavra-chave: ' + classification.material + '.'
        : 'A IA principal nao retornou uma classificacao confiavel para esse item.',
      ...classification,
    }),
    source: 'fallback',
  };
}

module.exports = { classifyWaste };
