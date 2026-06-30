const Scan = require('../models/Scan');
const User = require('../models/User');
const aiClassifierService = require('../services/aiClassifierService');

function calculateLevel(points) {
  return Math.floor(points / 500) + 1;
}

function toScanResponse(scan) {
  return {
    id: scan._id.toString(),
    wasteType: scan.wasteType,
    identifiedItem: scan.identifiedItem,
    material: scan.material,
    category: scan.category,
    binColor: scan.binColor,
    canRecycle: scan.canRecycle,
    points: scan.points,
    disposalGuide: scan.disposalGuide,
    reason: scan.reason,
    classificationSource: scan.classificationSource,
    confidence: scan.confidence,
    city: scan.city,
    lat: scan.lat,
    lng: scan.lng,
    imageProvided: scan.imageProvided,
    createdAt: scan.createdAt.toISOString(),
  };
}

async function createScan(req, res, next) {
  try {
    const { wasteType, city, lat, lng, image } = req.validated.body;
    const classification = await aiClassifierService.classifyWaste({ wasteType, city, lat, lng, image });

    if (!classification.isValidWaste) {
      const error = new Error(
        classification.reason || 'Nao foi possivel confirmar esse residuo. Tente outra foto ou descricao.',
      );
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    const finalWasteType = classification.wasteType || classification.identifiedItem || wasteType || 'Residuo identificado pela imagem';

    const scan = await Scan.create({
      user: req.user._id,
      wasteType: finalWasteType,
      identifiedItem: classification.identifiedItem || finalWasteType,
      material: classification.material,
      city,
      lat,
      lng,
      imageProvided: Boolean(image?.base64),
      category: classification.category,
      binColor: classification.binColor,
      canRecycle: classification.canRecycle,
      points: classification.points,
      disposalGuide: classification.disposalGuide,
      reason: classification.reason,
      classificationSource: classification.source,
      confidence: classification.confidence,
    });

    const updatedUser = await User.findById(req.user._id).select('_id points level');

    updatedUser.points += classification.points;
    updatedUser.level = calculateLevel(updatedUser.points);
    await updatedUser.save();

    res.status(201).json(toScanResponse(scan));
  } catch (error) {
    next(error);
  }
}

async function listScans(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Scan.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Scan.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      items: items.map(toScanResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createScan, listScans, toScanResponse };
