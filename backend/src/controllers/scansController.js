const Scan = require('../models/Scan');
const User = require('../models/User');
const { classifyWaste } = require('../services/wasteClassifier');

function calculateLevel(points) {
  return Math.floor(points / 500) + 1;
}

function toScanResponse(scan) {
  return {
    id: scan._id.toString(),
    wasteType: scan.wasteType,
    category: scan.category,
    binColor: scan.binColor,
    canRecycle: scan.canRecycle,
    points: scan.points,
    disposalGuide: scan.disposalGuide,
    city: scan.city,
    createdAt: scan.createdAt.toISOString(),
  };
}

async function createScan(req, res, next) {
  try {
    const { wasteType, city } = req.validated.body;
    const classification = classifyWaste({ wasteType, city });

    const scan = await Scan.create({
      user: req.user._id,
      wasteType,
      city,
      category: classification.category,
      binColor: classification.binColor,
      canRecycle: classification.canRecycle,
      points: classification.points,
      disposalGuide: classification.disposalGuide,
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