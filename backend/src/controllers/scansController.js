const Scan = require('../models/Scan');
const User = require('../models/User');

// tabela de classificação por palavras-chave no nome do item
const WASTE_RULES = [
  {
    keywords: ['pet', 'plástico', 'plastico', 'garrafa', 'pote', 'embalagem', 'sacola'],
    category: 'Plástico',
    binColor: 'Vermelho',
    canRecycle: true,
    points: 12,
    disposalGuide: 'Esvazie, amasse e descarte na lixeira vermelha.',
  },
  {
    keywords: ['papel', 'papelão', 'papelao', 'caixa', 'revista', 'jornal'],
    category: 'Papel',
    binColor: 'Azul',
    canRecycle: true,
    points: 10,
    disposalGuide: 'Mantenha seco e desdobre as caixas antes de descartar na lixeira azul.',
  },
  {
    keywords: ['metal', 'lata', 'alumínio', 'aluminio', 'ferragem', 'fio', 'tampinha'],
    category: 'Metal',
    binColor: 'Amarelo',
    canRecycle: true,
    points: 15,
    disposalGuide: 'Amasse latas e descarte na lixeira amarela.',
  },
  {
    keywords: ['vidro', 'garrafa', 'frasco', 'pote', 'copo'],
    category: 'Vidro',
    binColor: 'Verde',
    canRecycle: true,
    points: 14,
    disposalGuide: 'Embale vidros quebrados em jornal e descarte na lixeira verde.',
  },
  {
    keywords: ['orgânico', 'organico', 'comida', 'resto', 'alimento', 'casca', 'folha'],
    category: 'Orgânico',
    binColor: 'Marrom',
    canRecycle: false,
    points: 8,
    disposalGuide: 'Descarte na lixeira marrom ou utilize para compostagem.',
  },
];

function classifyWaste(wasteType) {
  const lower = wasteType.toLowerCase();
  for (const rule of WASTE_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule;
    }
  }
  // padrão: rejeito
  return {
    category: 'Rejeito',
    binColor: 'Cinza',
    canRecycle: false,
    points: 5,
    disposalGuide: 'Descarte na lixeira cinza. Reduza ao máximo esse volume.',
  };
}

// POST /api/scans
async function createScan(req, res) {
  try {
    const { image, wasteType, city } = req.body;

    // wasteType pode vir do frontend ou ser derivado de image
    // como não temos IA real, usamos wasteType enviado pelo app
    const identified = wasteType || 'Resíduo identificado';
    const rule = classifyWaste(identified);

    const scan = await Scan.create({
      user: req.userId,
      wasteType: identified,
      category: rule.category,
      points: rule.points,
      disposalGuide: rule.disposalGuide,
      canRecycle: rule.canRecycle,
      binColor: rule.binColor,
      city: city || '',
    });

    // adiciona pontos ao usuário
    const user = await User.findById(req.userId);
    if (user) {
      user.points += rule.points;
      user.updateLevel();
      await user.save();
    }

    res.status(201).json({
      id: scan._id,
      wasteType: scan.wasteType,
      category: scan.category,
      points: scan.points,
      disposalGuide: scan.disposalGuide,
      canRecycle: scan.canRecycle,
      binColor: scan.binColor,
      createdAt: scan.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/scans
async function listScans(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Scan.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-user -__v'),
      Scan.countDocuments({ user: req.userId }),
    ]);

    res.json({
      items: items.map(s => ({
        id: s._id,
        wasteType: s.wasteType,
        category: s.category,
        points: s.points,
        disposalGuide: s.disposalGuide,
        createdAt: s.createdAt,
      })),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createScan, listScans };
