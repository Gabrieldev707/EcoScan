function normalize(value) {
  return value.toLowerCase();
}

const CLASSIFICATIONS = [
  {
    category: 'Vidro',
    binColor: 'Verde',
    canRecycle: true,
    points: 10,
    keywords: ['vidro', 'garrafa de vidro', 'frasco', 'pote de conserva'],
    disposalGuide: 'Embale vidro quebrado com seguranca e descarte na lixeira verde.',
  },
  {
    category: 'Plástico',
    binColor: 'Vermelho',
    canRecycle: true,
    points: 12,
    keywords: ['pet', 'plastico', 'garrafa', 'sacola', 'embalagem', 'pote'],
    disposalGuide: 'Esvazie, amasse e descarte na lixeira vermelha.',
  },
  {
    category: 'Papel',
    binColor: 'Azul',
    canRecycle: true,
    points: 8,
    keywords: ['papel', 'papelao', 'jornal', 'revista', 'caixa'],
    disposalGuide: 'Mantenha seco, dobre caixas e descarte na lixeira azul.',
  },
  {
    category: 'Metal',
    binColor: 'Amarelo',
    canRecycle: true,
    points: 14,
    keywords: ['metal', 'lata', 'aluminio', 'aco', 'tampinha', 'ferragem'],
    disposalGuide: 'Esvazie, amasse quando possivel e descarte na lixeira amarela.',
  },
  {
    category: 'Orgânico',
    binColor: 'Marrom',
    canRecycle: false,
    points: 4,
    keywords: ['organico', 'comida', 'resto', 'casca', 'folha', 'fruta'],
    disposalGuide: 'Separe para compostagem quando disponivel ou descarte como organico.',
  },
];

const DEFAULT_CLASSIFICATION = {
  category: 'Rejeito',
  binColor: 'Cinza',
  canRecycle: false,
  points: 2,
  disposalGuide: 'Descarte na lixeira cinza e evite misturar com reciclaveis limpos.',
};

function classifyWaste(input) {
  const wasteType = input.wasteType.trim();
  const normalized = normalize(wasteType);
  const match = CLASSIFICATIONS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (!match) {
    return DEFAULT_CLASSIFICATION;
  }

  const { keywords, ...classification } = match;
  return classification;
}

module.exports = { classifyWaste };